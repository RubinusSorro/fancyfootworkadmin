// admin.js — Fancy Footwork Admin Panel (with Backend API)
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = 'http://localhost:3000/api';  // Backend URL

  // === AUTHENTICATION ===
  let isLoggedIn = false;

  function showLoginModal() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
  }

  function hideLoginModal() {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (loginModal) loginModal.hide();
  }

  function logout() {
    localStorage.removeItem('adminLoggedIn');
    isLoggedIn = false;
    showLoginModal();
    document.querySelector('.sidebar').style.display = 'none';
    document.querySelector('main').style.display = 'none';
  }

  // Always show login modal on load
  showLoginModal();

  // Login form handler
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        isLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        hideLoginModal();
        document.querySelector('.sidebar').style.display = 'block';
        document.querySelector('main').style.display = 'block';
        loadDashboard(); // Load initial data
        loadSettings(); // Load and apply theme globally
        errorEl.style.display = 'none';
      } else {
        errorEl.textContent = data.message || 'Invalid credentials';
        errorEl.style.display = 'block';
      }
    } catch (err) {
      console.error('Login error:', err);
      errorEl.textContent = 'Login failed. Please try again.';
      errorEl.style.display = 'block';
    }
  });

  // Logout handler
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // === INITIAL SETUP ===
  const productTableBody = document.getElementById("productsTableBody");
  const totalProductsEl = document.getElementById("totalProducts");
  const totalOrdersEl = document.getElementById("totalOrders");
  const totalCustomersEl = document.getElementById("totalCustomers");
  const totalSalesEl = document.getElementById("totalSales");
  const recentOrdersBody = document.getElementById("recentOrdersBody");
  const ordersTableBody = document.getElementById("ordersTableBody");
  const customersTableBody = document.getElementById("customersTableBody");

  // === FUNCTIONS ===
  async function loadDashboard() {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      const data = await res.json();
      totalProductsEl.textContent = data.totalProducts;
      totalOrdersEl.textContent = data.totalOrders;
      totalCustomersEl.textContent = data.totalCustomers;
      totalSalesEl.textContent = `₱${parseFloat(data.totalSales).toLocaleString("en-US")}`;
      renderRecentOrders(data.recentOrders);

      // Load and render sales chart
      const salesRes = await fetch(`${API_BASE}/reports/sales`);
      const salesData = await salesRes.json();
      renderDashboardSalesChart(salesData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  }

  function renderDashboardSalesChart(data) {
    const ctx = document.getElementById('dashboardSalesChart').getContext('2d');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = data.map(d => monthNames[d.month - 1]);
    const sales = data.map(d => d.sales);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales (₱)',
          data: sales,
          borderColor: '#c90000',
          backgroundColor: 'rgba(201, 0, 0, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₱' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  function renderRecentOrders(orders) {
    recentOrdersBody.innerHTML = orders.map(order => `
      <tr>
        <td>${order.id}</td>
        <td>${order.customer}</td>
        <td>${order.status}</td>
        <td>${order.qty}</td>
        <td>₱${parseFloat(order.total).toLocaleString("en-US")}</td>
      </tr>
    `).join('');
  }

  async function loadProducts() {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const products = await res.json();
      renderProducts(products);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  function renderProducts(products) {
    productTableBody.innerHTML = products.length === 0 ? `<tr><td colspan="7" class="text-center text-muted">No products found</td></tr>` :
      products.map((product, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><img src="${product.image_url || 'https://via.placeholder.com/60'}" width="60" height="60" style="object-fit:cover;border-radius:5px;"></td>
          <td>${product.name}</td>
          <td>${product.stock}</td>
          <td>₱${parseFloat(product.price).toLocaleString("en-US")}</td>
          <td>${product.category}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${product.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${product.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `).join('');
  }

  async function loadOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const orders = await res.json();
      ordersTableBody.innerHTML = orders.map(order => `
        <tr>
          <td>${order.id}</td>
          <td>${order.customer}</td>
          <td>
            <select class="form-select form-select-sm status-select" data-id="${order.id}">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>${order.qty}</td>
          <td>₱${parseFloat(order.total).toLocaleString("en-US")}</td>
          <td>
            <button class="btn btn-sm btn-outline-success update-status-btn" data-id="${order.id}">Update</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  }

  async function loadCustomers() {
    try {
      const res = await fetch(`${API_BASE}/customers`);
      const customers = await res.json();
      customersTableBody.innerHTML = customers.map(customer => `
        <tr>
          <td>${customer.id}</td>
          <td>${customer.name}</td>
          <td>${customer.email}</td>
          <td>${customer.phone}</td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  }

  async function loadReports() {
    try {
      const res = await fetch(`${API_BASE}/reports/sales`);
      const data = await res.json();
      // Render chart with Chart.js (assuming canvas is available)
      const ctx = document.getElementById('salesChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => `Month ${d.month}`),
          datasets: [{ label: 'Sales', data: data.map(d => d.sales), backgroundColor: '#c90000' }]
        }
      });
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  }

  // === ADD PRODUCT ===
  document.getElementById("addProductForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById("productName").value);
    formData.append('price', document.getElementById("productPrice").value);
    formData.append('stock', document.getElementById("productStock").value);
    formData.append('category', document.getElementById("productCategory").value);
    formData.append('image', document.getElementById("productImage").files[0]);

    try {
      await fetch(`${API_BASE}/products`, { method: 'POST', body: formData });
      loadProducts();
      loadDashboard();
      bootstrap.Modal.getInstance(document.getElementById("addProductModal")).hide();
      e.target.reset();
    } catch (err) {
      console.error('Error adding product:', err);
    }
  });

  // === EDIT/DELETE PRODUCT ===
  document.getElementById("productsTableBody").addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
      const id = editBtn.dataset.id;
      // Fetch product details and populate edit modal (implement similar to add)
      // For brevity, assume you handle edit modal similarly
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (confirm("Are you sure?")) {
        await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
        loadProducts();
        loadDashboard();
      }
    }
  });

  // === ORDER STATUS UPDATE ===
  document.getElementById("ordersTableBody").addEventListener("click", async (e) => {
    const updateBtn = e.target.closest(".update-status-btn");
    if (updateBtn) {
      const id = updateBtn.dataset.id;
      const selectEl = document.querySelector(`.status-select[data-id="${id}"]`);
      const newStatus = selectEl.value;

      try {
        const res = await fetch(`${API_BASE}/orders/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
          alert('Order status updated successfully!');
          loadOrders(); // Reload orders to reflect changes
          loadDashboard(); // Update dashboard if needed
        } else {
          alert('Failed to update order status.');
        }
      } catch (err) {
        console.error('Error updating order status:', err);
        alert('Error updating order status.');
      }
    }
  });

  // === NAVIGATION ===
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      document.querySelectorAll("main section").forEach((section) => section.classList.add("d-none"));
      const target = document.getElementById(link.dataset.target);
      target.classList.remove("d-none");

      // Load data based on section
      if (link.dataset.target === 'productsSection') loadProducts();
      else if (link.dataset.target === 'ordersSection') loadOrders();
      else if (link.dataset.target === 'customersSection') loadCustomers();
      else if (link.dataset.target === 'reportsSection') loadReports();
      else if (link.dataset.target === 'settingsSection') loadSettings();
    });
  });

  // === SETTINGS ===
  async function loadSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      const settings = await res.json();
      document.getElementById('adminName').value = settings.profile_name || '';
      document.getElementById('adminEmail').value = settings.profile_email || '';
      document.getElementById('lowStockThreshold').value = settings.low_stock_threshold || 5;
      document.getElementById('defaultSortOrder').value = settings.default_sort_order || 'newest';
      const theme = settings.site_theme || 'light';
      document.getElementById('siteTheme').value = theme;
      document.getElementById('themeToggle').checked = theme === 'dark';
      document.getElementById('themeLabel').textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
      applyTheme(theme);
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  }

  function applyTheme(theme) {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }

  // Theme toggle handler
  document.getElementById('themeToggle').addEventListener('change', (e) => {
    const theme = e.target.checked ? 'dark' : 'light';
    document.getElementById('siteTheme').value = theme;
    document.getElementById('themeLabel').textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    applyTheme(theme);
  });

  // Unified settings form
  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    const data = {
      profile_name: document.getElementById('adminName').value,
      profile_email: document.getElementById('adminEmail').value,
      low_stock_threshold: parseInt(document.getElementById('lowStockThreshold').value) || 0,
      default_sort_order: document.getElementById('defaultSortOrder').value,
      site_theme: document.getElementById('siteTheme').value
    };
    if (password) {
      data.profile_password = password;
    }
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update settings');
      alert('Settings updated successfully!');
      document.getElementById('adminPassword').value = ''; // Clear password field
      loadSettings(); // Refresh UI with updated values
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Failed to update settings.');
    }
  });

  // === INITIAL LOAD ===
  loadDashboard();
});
