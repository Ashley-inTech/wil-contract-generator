import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bodyParser from 'body-parser';

import indexRoutes from './routes/indexRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.set('json spaces', 2); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT;
const PORT = process.env.PORT || 3000;

// Routes
app.use('/api', indexRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`DB_HOST: ${DB_HOST}`);
    console.log(`DB_USER: ${DB_USER}`);
    console.log(`DB_NAME: ${DB_NAME}`);
    console.log(`DB_PORT: ${DB_PORT}`);
    console.log(`API URL: http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;