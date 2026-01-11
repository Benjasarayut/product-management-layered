const express = require('express');
const productRoutes = require('./src/presentation/routes/productRoutes');
const errorHandler = require('./src/presentation/middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/api/products', productRoutes);
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║  Product Management System (Layered)          ║
║  Server running on http://localhost:${PORT}   ║
║  API: http://localhost:${PORT}/api/products   ║
╚══════════════════════════════════════════════╝
    `);
});
