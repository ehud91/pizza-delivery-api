const User = require('../models/userModel');
const base = require('./baseController');
const AppError = require('../utils/appError');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});
const { v4: uuid_v4 } = require('uuid');

exports.deleteMe = async (req, res, next) => {

    const reqUuid = uuid_v4();
    try {
        const {
            email    
        } = req.body;
        
        logger.info(`{${reqUuid}} Delete user request`);

        // check if user exist and password is correct
        const isFoundUser = await User.findOne({
            email
        }).select('+password');

        if (!isFoundUser) {        
            logger.error(`{${reqUuid}} Validation Error: Could not delete user by email - user email not found, email={${email}}`);
            return next(new AppError(401, 'Authentication failure', `Could not found a user with the required email`), req, res, next);
        }
        await User.findOneAndDelete(isFoundUser.id, {
            active: false
        });

        logger.info(`{${reqUuid}} User found, email={${email}}, userId={${isFoundUser.id}}`);
        logger.info(`{${reqUuid}} Delete user request succeeded`);

        res.status(200).json({
            status: 'success',
            desc: `User - '${email}', was successfuly removed`,
            data: null
        });
    } catch (error) {
        next(error);
    }
}

exports.getAllUsers = base.getAll(User);
exports.getUser = base.getOne(User);

exports.updateUser = base.updateOne(User);
exports.deleteUser = base.deleteOne(User);