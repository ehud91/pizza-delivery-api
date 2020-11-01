const express = require('express');
const router = express.Router();
const pizzaController = require('../controllers/pizzaController');
const authController = require('../controllers/authController');

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/items', pizzaController.getItems);
router.post('/addCartItem', authController.notValidMethod('addCartItem', 'Post'));
router.delete('/addCartItem', authController.notValidMethod('addCartItem', 'Post'));
router.put('/addCartItem', authController.notValidMethod('addCartItem', 'Post'));

router.post('/addCartItem', pizzaController.fillCartWithItems);
router.get('/addCartItem', authController.notValidMethod('addCartItem', 'Post'));
router.delete('/addCartItem', authController.notValidMethod('addCartItem', 'Post'));
router.put('/addCartItem', authController.notValidMethod('addCartItem', 'Post'));

router.post('/placeAnOrder', pizzaController.placeAnOrder);
router.get('/placeAnOrder', authController.notValidMethod('placeAnOrder', 'Post'));
router.delete('/placeAnOrder', authController.notValidMethod('placeAnOrder', 'Post'));
router.put('/placeAnOrder', authController.notValidMethod('placeAnOrder', 'Post'));

module.exports = router;