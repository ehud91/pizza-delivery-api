const AppError = require('../utils/appError');
const APIFeatres = require('../utils/apiFeatures');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

exports.deleteOne = Model => async (req, res, next) => {
    try {
        logger.info("Delete request");

        if(!req.params.id || req.params.id === undefined) {
            logger.error("Validation Error: Delete request - id parameter was not provided");
            return next(new AppError(404, 'fail', 'Request id parameter is required !'), req, res, next);   
        }

        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            logger.error("Validation Error: Could not find the document by id in database");
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);            
        }

        logger.info(`Found document id in database, documentId={${req.params.id}}`);
        logger.info("Delete request succeeded");

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        logger.error(`Exception Error: Could not delete the document by id in database, error={${error}}`);
        next(error);
    }
};

exports.updateOne = Model => async (req, res, next) => {
    try {
        logger.info("Update request");

        if(!req.params.id || req.params.id === undefined) {
            logger.error("Validation Error: Delete request - id parameter was not provided");
            return next(new AppError(404, 'fail', 'Request id parameter is required !'), req, res, next);   
        }

        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!doc) {
            logger.error("Validation Error: Could not find the document by id in database");
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);           
        }

        logger.info(`Found document id in database, documentId={${req.params.id}}`);
        logger.info("Update request succeeded");

        res.status(200).json({
            status: 'success',
            data: {
                doc
            }
        });
    } catch (error) {
        logger.error(`Exception Error: Could not update the document by id in database, error={${error}}`);
        next(error);
    }
};

exports.createOne = Model => async (req, res, next) => {
    try {
        logger.info("Create request");

        const doc = await Model.create(req.body);

        logger.info("Create request succeeded");

        res.status(201).json({
            status: 'success',
            data: {
                doc
            }
        });
    } catch (error) {
        logger.error(`Exception Error: Could not create the document by id in database, error={${error}}`);
        next(error);
    }
};

exports.getOne = Model => async (req, res, next) => {
    try {
        logger.info("Get document request");

        if(!req.params.id || req.params.id === undefined) {
            logger.error("Validation Error: Get document request - id parameter was not provided");
            return next(new AppError(404, 'fail', 'Request id parameter is required !'), req, res, next);   
        }

        const doc = await Model.findById(req.params.id);

        if (!doc) {
            logger.error("Validation Error: Could not find the document by id in database");
            return next(new AppError(404, 'fail', 'No document found with that id'), req, res, next);
        }

        logger.info(`Found document id in database, documentId={${req.params.id}}`);
        logger.info("Get document request succeeded");

        res.status(200).json({
            status: 'success',
            data: {
                doc
            }
        });
    } catch (error) {
        logger.error(`Exception Error: Could not get a document by id in database, error={${error}}`);
        next(error);
    }
};

exports.getAll = Model => async (req, res, next) => {
    try {
        logger.info("Get all documents info request");

        const features = new APIFeatres(Model.find(), req.query)
            .sort()
            .paginate();
        
        const doc = await features.query;

        logger.info("Get all documents info request succeeded");

        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc
            }
        });
    } catch (error) {
        logger.error(`Exception Error: Could not get all documents from database, error={${error}}`);
        next(error);
    }
};