const mongoose = require('mongoose');
const dotenv = require("dotenv");

const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

dotenv.config({
  path: "./config.env",
});

process.on("uncaughtException", (err) => {  
  logger.error("Exception Error: UNCAUGHT EXCEPTION!!! shutting down...");
  logger.error('Exception Error: error name: ' + err.name);
  logger.error('Exception Error: error message: ' + err.message);
  logger.error(err);
  process.exit(1);
});

const app = require('./app');

const database = process.env.DATABASE;

// Connect the database
try {
  mongoose.connect(database, {
    useCreateIndex: true,
    useNewUrlParser: true, 
    useUnifiedTopology: true
  }).then(con => {    
    logger.info("connected to database");
  });
}catch(error) {  
  logger.error("Exception Error: DB coonection was failed, could not connect to database");
}


// Start the server
//const port = process.env.PORT || 3003;
const port = 3003;
app.listen(port, () => {
  logger.info(`Application is running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  logger.error('Exception Error: UNHANDLED REJECTION!!!  shutting down ...');
  logger.error(err.name, err.message);
  logger.error('Exception Error: error name: ' + err.name);
  logger.error('Exception Error: error message: ' + err.message);
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});