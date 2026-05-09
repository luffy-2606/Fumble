// middleware/error.middleware.js
// Attach as the LAST app.use() in server.js

const errorHandler = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);

    const status = err.statusCode || err.status || 500;
    res.status(status).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;