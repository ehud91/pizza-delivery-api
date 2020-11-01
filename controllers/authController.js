const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});
const { v4: uuid_v4 } = require('uuid');

const createToken = id => {
    return jwt.sign({
        id
    }, 
    process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.login = async (req, res, next) => {

    const reqUuid = uuid_v4();
    try {
        const {
            email,
            password
        } = req.body;
        
        logger.info(`{${reqUuid}} Login request`);

        // check if email and password exist
        if (!email || !password) {   
            logger.error(`{${reqUuid}} Validation Error; Login request - email or password were not provided`);         
            return next(new AppError(404, 'fail', 'Please provide email or password'), req, res, next);
        }
        
        // check if user exist and password is correct
        const user = await User.findOne({
            email
        }).select('+password');

        if (!user || !await user.correctPassword(password, user.password)) {
            logger.error(`{${reqUuid}} Validation Error; Login request - Could not found user by email and password, email={${email}}, password={${password}}`);
            return next(new AppError(401, 'fail', 'Email or Password is wrong'), req, res, next);
        }

        const token = createToken(user.id);

        logger.info(`{${reqUuid}} New token created, token={${token}}`);

        // Remove the password from output
        user.password = undefined;

        logger.info(`{${reqUuid}} Login succeeded`);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (error) {
        logger.info(`{${reqUuid}} Exception Error: Got error in login process error={${error}}`);
        next(error)
    }  
};

exports.signup = async (req, res, next) => {
    
    const reqUuid = uuid_v4();
    try {      
        const {
            name,
            email,
            password,
            passwordConfirm,
            streetAddress,
            role
        } = req.body;

        logger.info(`{${reqUuid}} Signup request`);

        if (!email || email === undefined || email === '') {
            logger.error(`{${reqUuid}} Validation Error; Signup request - email was not provided`);
            return next(new AppError(401, 'Authentication failure', `Email field is required, please fill your email`), req, res, next);
        }

        if (!password || password === undefined || password === '') {
            logger.error(`{${reqUuid}} Validation Error; Signup request - password was not provided`);
            return next(new AppError(401, 'Authentication failure', `Password field is required, please fill your password`), req, res, next);
        }

        if (!passwordConfirm || passwordConfirm === undefined || passwordConfirm === '') {
            logger.error(`{${reqUuid}} Validation Error; Signup request - passwordConfirm was not provided`);
            return next(new AppError(401, 'Authentication failure', `passwordConfirm field is required, please fill your password confirm`), req, res, next);
        }

        logger.info(`{${reqUuid}} Got request from user, name={${name}}, email={${email}}, password={${password}}, passwordConfirm={${passwordConfirm}}, streetAddress={${streetAddress}}, role={${role}}`);

        // check if user exist and password is correct
        const isFoundUser = await User.findOne({
            email
        }).select('+password');
        
        if (isFoundUser) {
            logger.error(`{${reqUuid}} Validation Error; Signup request - The user is already exist, email={${email}}`);
            return next(new AppError(401, 'Authentication failure', `You cannot use this email, Please provide another email`), req, res, next);
        }

        const user = await User.create({
            name: name,
            email: email,
            password: password,
            streetAddress: streetAddress,
            passwordConfirm: passwordConfirm,            
            role: role
        });        

        logger.info(`{${reqUuid}} New user created, userEmail={${email}}`);

        const token = createToken(user.id);

        logger.info(`{${reqUuid}} New token created, token={${token}}`);

        user.password = undefined;

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (error) {
        logger.info(`{${reqUuid}} Exception Error: Got error in signup process error={${error}}`);
        next(error);
    }
};

exports.protect = async (req, res, next) => {

    const reqUuid = uuid_v4();
    try {
        logger.info(`{${reqUuid}} Authentication check`);
        // check if the token is there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            logger.error(`{${reqUuid}} Validation Error: Authentication check failed - error in token, token={${token}}`);
            return next(new AppError(401, 'fail', 'You are not logged in! Please login to continue'), req, res, next);
        }

        // Verify token
        const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        logger.info(`{${reqUuid}} Token decode, token={${token}}, decode={${decode}}`);

        const user = await User.findById(decode.id);
        if (!user) {
            logger.error(`{${reqUuid}} Validation Error: Authentication check failed - Could not find user id by token, decodeId={${decode.id}}`);
            return next(new AppError(401, 'fail', 'This user is no longer exist'), req, res, next);            
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error(`{${reqUuid}} Exception Error: Authentication check process failed - error={${error}}`);
        next(error);
    }
};

// Authorization check if the user have right to do this action
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        const reqUuid = uuid_v4();
        if(!roles.includes(req.user.role)) {
            logger.error(`{${reqUuid}} Validation Error: Authentication check found - user are not allowd to do this action`);
            return next(new AppError(403, 'fail', 'You are not allowed to do this action'), req, res, next);
        }
        next();
    };
};

exports.notValidMethod = (funcName, acceptMethod) => {
    return (req, res, next) => {
        const reqUuid = uuid_v4();
        logger.error(`{${reqUuid}} Validation Error: Not valid method found, funcName={${funcName}}`);
        return next(new AppError(401, 'Bad request', `${funcName} method can only accept ${acceptMethod} method`), req, res, next);  
    }
};