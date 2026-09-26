const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./adapters/routes/auth.routes');
const userRoutes = require('./adapters/routes/user.routes');
const addressRoutes = require('./adapters/routes/address.routes');
const categoryRoutes = require('./adapters/routes/category.routes');
const productRoutes = require('./adapters/routes/product.routes');
const stockRoutes = require('./adapters/routes/stock.routes');
const locationRoutes = require('./adapters/routes/location.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Servir archivos estáticos subidos (imágenes de productos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Endpoint de verificación de salud del servidor
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'AppDelivery Backend' }));

// Registro de módulos API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/orders', require('./adapters/routes/order.routes'));

module.exports = app;
