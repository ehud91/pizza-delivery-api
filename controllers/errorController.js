// Express automatically knows that this entire function is an error handling middleware by specifying 4 parameters
module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.staus = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        code: err.statusCode
    });
};