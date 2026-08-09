const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./presentation/routes/auth.routes');
const userRoutes = require('./presentation/routes/user.routes');
const addressRoutes = require('./presentation/routes/address.routes');
const categoryRoutes = require('./presentation/routes/category.routes');
const productRoutes = require('./presentation/routes/product.routes');
const stockRoutes = require('./presentation/routes/stock.routes');
const locationRoutes = require('./presentation/routes/location.routes');

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

module.exports = app;