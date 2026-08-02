const express        = require('express');
const path           = require('path');
const cors           = require('cors');
const categoryRoutes = require('./presentation/routes/category.routes');
const productRoutes  = require('./presentation/routes/product.routes');
const stockRoutes    = require('./presentation/routes/stock.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Servir imágenes estáticas desde /uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rutas
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/categories', categoryRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/stock',      stockRoutes);

module.exports = app;