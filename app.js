const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

const userRoutes = require('./routes/userRoutes');
const pizzaRoutes = require('./routes/pizzaRoutes');
const globalErrHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const app = express();
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

// Allow Cross-Origin requests
app.use(cors());
logger.info('Allow Cross-Origin requests');

// Set security HTTP headers
app.use(helmet());
logger.info('Set security HTTP headers');

// Limit request from the same API
const limiter = rateLimit({
  max: 150,
  windowMs: 15 * 60 * 1000,
  message: "Too many request from this IP, please try again in fiffty minutes",
});


app.use("/api", limiter);
logger.info('Application use prefix - /api');
logger.info('Limit request from the same API, maxRequests={150}, waitFor={15 seconds}');

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: "15kb",
  })
);
logger.info('Application use express json limit={15kb}');

// Data sanitization against Nosql query injection
app.use(mongoSanitize());
logger.info('Application using mongo sanitize');

app.use(xss());
logger.info('Application using xss');

// Prevent parameter pollution
app.use(hpp());
logger.info('Application using hpp - Prevent parameter pollution');

// Routes
app.use('/api/v1/users', userRoutes);
logger.info('Application route1 - /api/v1/users');

app.use('/api/v1/pizza', pizzaRoutes);
logger.info('Application route2 - /api/v1/pizza');

app.use("*", (req, res, next) => {
  logger.error('Application detected undefined route');
  return next(new AppError(404, 'fail', 'You tryied an undefined route'), req, res, next);
});

app.use(globalErrHandler);

module.exports = app;
logger.info('Application stated');
