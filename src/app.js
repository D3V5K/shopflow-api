const express = require("express");
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const errorHandler = require('./middlewares/error.middleware');
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);


app.use(errorHandler);


module.exports = app;