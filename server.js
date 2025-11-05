const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));  // Serve static files (e.g., images)
app.use('/uploads', express.static('uploads'));  // Serve uploaded images

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// MySQL connection (updated for your setup)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // No password
    database: 'fancyworks'  // Updated database name
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Multer for image uploads (saves to 'uploads' folder)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(new Error('Only PNG and JPG files are allowed'), false);
    }
};
const upload = multer({ storage, fileFilter });

// API Endpoints

// Get dashboard data
app.get('/api/dashboard', (req, res) => {
    const queries = {
        totalProducts: 'SELECT COUNT(*) AS count FROM products',
        totalOrders: 'SELECT COUNT(*) AS count FROM orders',
        totalCustomers: 'SELECT COUNT(*) AS count FROM customers',
        totalSales: 'SELECT SUM(total) AS sum FROM orders',
        recentOrders: 'SELECT o.id, c.name AS customer, o.status, SUM(oi.quantity) AS qty, o.total FROM orders o JOIN customers c ON o.customer_id = c.id JOIN order_items oi ON o.id = oi.order_id GROUP BY o.id ORDER BY o.order_date DESC LIMIT 5'
    };

    const results = {};
    let completed = 0;

    Object.keys(queries).forEach(key => {
        db.query(queries[key], (err, data) => {
            if (err) return res.status(500).json({ error: err.message });
            results[key] = data;
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json({
                    totalProducts: results.totalProducts[0].count,
                    totalOrders: results.totalOrders[0].count,
                    totalCustomers: results.totalCustomers[0].count,
                    totalSales: results.totalSales[0].sum || 0,
                    recentOrders: results.recentOrders
                });
            }
        });
    });
});

// Get all products
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// Add product (description and sizes are optional)
app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, description = '', price, stock, sizes = '', category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const sizesJson = sizes ? JSON.stringify(sizes.split(',').map(s => s.trim())) : JSON.stringify([]);

    db.query('INSERT INTO products (name, description, price, stock, sizes, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, description, price, stock, sizesJson, category, image_url], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product added' });
        });
});

// Update product (description and sizes are optional)
app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, description = '', price, stock, sizes = '', category } = req.body;
    const sizesJson = sizes ? JSON.stringify(sizes.split(',').map(s => s.trim())) : JSON.stringify([]);
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    db.query('UPDATE products SET name=?, description=?, price=?, stock=?, sizes=?, category=?, image_url=? WHERE id=?',
        [name, description, price, stock, sizesJson, category, image_url, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product updated' });
        });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    db.query('DELETE FROM products WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted' });
    });
});

// Get all orders
app.get('/api/orders', (req, res) => {
    db.query('SELECT o.id, c.name AS customer, o.status, SUM(oi.quantity) AS qty, o.total FROM orders o JOIN customers c ON o.customer_id = c.id JOIN order_items oi ON o.id = oi.order_id GROUP BY o.id', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// Get order items for a specific order
app.get('/api/orders/:id/items', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM order_items WHERE order_id = ?', [id], (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.query('UPDATE orders SET status=? WHERE id=?', [status, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order status updated' });
    });
});

// Get all customers
app.get('/api/customers', (req, res) => {
  db.query('SELECT id, name, email, phone FROM customers', (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(data);
  });
});

// Add new customer (from client registration)
app.post('/api/customers', (req, res) => {
    const { firstName, lastName, email, phone, addressLine1, addressLine2, state, postalCode, country, dob, gender } = req.body;
    const fullName = `${firstName} ${lastName}`;
    const fullAddress = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${state}, ${country} ${postalCode}`;

    db.query('INSERT INTO customers (name, email, phone, address, dob, gender) VALUES (?, ?, ?, ?, ?, ?)',
        [fullName, email, phone, fullAddress, dob, gender], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Customer added successfully' });
        });
});

// Get reports (monthly sales)
app.get('/api/reports/sales', (req, res) => {
    db.query('SELECT MONTH(order_date) AS month, SUM(total) AS sales FROM orders GROUP BY MONTH(order_date)', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// Add new order (from client checkout)
app.post('/api/orders', (req, res) => {
    const { customer, items, total, shipping } = req.body;

    // First, check if customer exists, if not, insert
    db.query('SELECT id FROM customers WHERE email = ?', [customer.email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        let customerId;
        if (result.length > 0) {
            customerId = result[0].id;
            insertOrder();
        } else {
            // Insert new customer
            const fullName = `${customer.firstName} ${customer.lastName}`;
            const fullAddress = `${customer.address}, ${customer.phone}`;
            db.query('INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
                [fullName, customer.email, customer.phone, fullAddress], (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    customerId = result.insertId;
                    insertOrder();
                });
        }

        function insertOrder() {
            // Insert order
            db.query('INSERT INTO orders (customer_id, total, status) VALUES (?, ?, ?)',
                [customerId, total, 'pending'], (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    const orderId = result.insertId;

                    // Insert order items
                    const itemQueries = items.map(item => {
                        return new Promise((resolve, reject) => {
                            db.query('INSERT INTO order_items (order_id, quantity, price) VALUES (?, ?, ?)',
                                [orderId, item.quantity, item.price], (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                });
                        });
                    });

                    Promise.all(itemQueries).then(() => {
                        res.json({ message: 'Order placed successfully', orderId });
                    }).catch(err => res.status(500).json({ error: err.message }));
                });
        }
    });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Simple hardcoded credentials for demo (replace with DB check in production)
    if (username === 'admin' && password === 'password') {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Get settings
app.get('/api/settings', (req, res) => {
    db.query('SELECT * FROM settings WHERE id = 1', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        if (data.length === 0) {
            // Insert default settings
            const defaults = {
                profile_name: 'Admin User',
                profile_email: 'admin@fancyworks.com',
                site_theme: 'light',
                low_stock_threshold: 5,
                default_sort_order: 'newest'
            };
            db.query('INSERT INTO settings SET ?', defaults, (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                defaults.id = result.insertId;
                res.json(defaults);
            });
        } else {
            res.json(data[0]);
        }
    });
});

// Update settings
app.post('/api/settings', upload.single('site_logo'), (req, res) => {
    const updates = req.body;
    if (req.file) {
        updates.site_logo = `/uploads/${req.file.filename}`;
    }
    db.query('UPDATE settings SET ? WHERE id = 1', updates, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Settings updated successfully' });
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
