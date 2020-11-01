const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

router.post('/login', authController.login);
router.get('/login', authController.notValidMethod('login', 'Post'));
router.delete('/login', authController.notValidMethod('login', 'Post'));
router.put('/login', authController.notValidMethod('login', 'Post'));

router.post('/signup', authController.signup);
router.get('/signup', authController.notValidMethod('signup', 'Post'));
router.delete('/signup', authController.notValidMethod('signup', 'Post'));
router.put('/signup', authController.notValidMethod('signup', 'Post'));

// Protect all routes after this middleware
router.use(authController.protect);

router.delete('/delete', userController.deleteMe);
router.get('/delete', authController.notValidMethod('delete', 'Delete'));
router.post('/delete', authController.notValidMethod('delete', 'Delete'));
router.put('/delete', authController.notValidMethod('delete', 'Delete'));

// Only admin have permission to access for below APIs
router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;