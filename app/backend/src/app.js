const express = require('express');
const addressRoutes = require('./presentation/routes/address.routes');
const cors = require('cors');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint de verificación de salud del servidor
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'AppDelivery Backend' }));

// Registro del módulo de direcciones (Gracia)
app.use('/api/addresses', addressRoutes);

module.exports = app;