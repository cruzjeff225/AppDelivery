const express = require('express');
const authRoutes = require('./presentation/routes/auth.routes');

const app = express();

app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
module.exports = app;