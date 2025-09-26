// Monthly Sales
const salesCtx = document.getElementById('salesChart').getContext('2d');
new Chart(salesCtx, {
  type: 'line',
  data: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [{
      label: 'Sales (₱)',
      data: [0,0,0,0,0,0,0,0,0,0,0,0],
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13,110,253,0.08)',
      tension: 0.3,
      fill: true,
      pointRadius: 3,
      pointBackgroundColor: '#0d6efd'
    }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#333' } },
      x: { ticks: { color: '#333' } }
    }
  }
});

// Orders
const categoryCtx = document.getElementById('categoryChart').getContext('2d');
new Chart(categoryCtx, {
  type: 'doughnut',
  data: {
    labels: ['', '', ''],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#0d6efd', '#198754', '#ffc107'],
      borderWidth: 2
    }]
  },
  options: {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#333', font: { size: 14 } }
      }
    }
  }
});
