
const AppError = require('../utils/appError');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const GenealUtils = require('../utils/genealUtils');
const utils = new GenealUtils();
const https = require("https");
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});
const { v4: uuid_v4 } = require('uuid');

const pizzaItems = [
    { item: 'Cheese', desc: 'Mozzarella and tomato sauce', price: 3.50, productId: 1}, 
    { item: 'The Mootz', desc: 'The Mootz Fresh mozzarella, fresh garlic, Pecorino Romano', price: 4.25, productId: 2},
    { item: 'Pepperoni', desc: 'Pepperoni Cheese pie with pepperoni', price: 4.25, productId: 3},
    { item: 'Sausage', desc: 'Sausage Cheese Pie with sweet Italian fennel', price: 4.25, productId: 4},
    { item: 'Hellboy®', desc: 'Our pepperoni pie with Mike’s Hot Honey', price: 4.25, productId: 5},
    { item: 'Freddy Prince', desc: 'Upside down Sicilian with fresh mozzarella, tomato sauce, pecorino romano and a sesame seed bottom', price: 4.50, productId: 6},
    { item: 'Hellboy²', desc: 'Upside down Sicilian with fresh mozzarella, tomato sauce, pecorino romano, Ezzo pepperoni, Mike’s Hot Honey and a sesame seed bottom', price: 5, productId: 7}
];

exports.getItems = async (req, res, next) => {

    const reqUuid = uuid_v4();
    logger.info(`{${reqUuid}} Get all pizza items request`);

    res.status(200).json({
        status: 'success',        
        data: {
            items: [
                pizzaItems
            ]
        }
    });
};

exports.fillCartWithItems = async (req, res, next) => {

    const reqUuid = uuid_v4();
    const {
        cartId,
        productId,                
        quantity,        
    } = req.body;

    logger.info(`{${reqUuid}} Fill cart with items request`);

    if (!cartId || cartId === undefined || cartId === '') {
        logger.error(`{${reqUuid}} Validation Error: cartId paremter is not given`);
        return next(new AppError(401, 'Authentication failure', `cartId field is required, please fill cartId`), req, res, next);
    }

    if (!productId || productId === undefined || productId === '') {
        logger.error(`{${reqUuid}} Validation Error: productId paremter is not given`);
        return next(new AppError(401, 'Authentication failure', `productId field is required, please fill productId`), req, res, next);
    }

    const pizzaItem = (pizzaItems[productId] !== undefined) ? pizzaItems[productId]: {};

    logger.info(`{${reqUuid}} Filter pizza item by product id, productId={${productId}}`);
    
    if(!utils.isObjectEmpty(pizzaItem)) {

        logger.info(`{${reqUuid}} Product found, pizzaItem={${pizzaItem}}`);

        logger.info(`{${reqUuid}} search for exsiting cart by cart id, cardId={${cartId}}`);
        const isCartId = await Cart.findOne({
            'cart.cartId': cartId 
        });

        let successMessage = '';
        let cartItem = {};
        if(isCartId) {

            logger.info(`{${reqUuid}} cart id was found, cartId={${isCartId}}`);

            const newItem = {
                productId: pizzaItem.productId,
                productName: pizzaItem.item,
                description: pizzaItem.desc,
                price: pizzaItem.price,                
                quantity: quantity
            }        
            cartItem = isCartId;            
            cartItem.cart.items.push(newItem);
            cartItem.cart.totalItems = cartItem.cart.items.length;            
            let sumPrice = 0;
            let sumQuantity = 0;
            for(let i = 0; i < cartItem.cart.totalItems; i++) {
                sumPrice += cartItem.cart.items[i].price;
                sumQuantity += cartItem.cart.items[i].quantity;
            }
            cartItem.cart.totalQuantity = sumQuantity;
            cartItem.cart.totalPrice = sumPrice;
            successMessage = 'New item added to cart';

            logger.info(`{${reqUuid}} Update card by cartId, cartItem={${newItem}}`);
        } else {
            cartItem = {
                    cart: {
                        cartId: cartId,
                        items: [{
                            productId: pizzaItem.productId,
                            productName: pizzaItem.item,
                            description: pizzaItem.desc,
                            price: pizzaItem.price,
                            quantity: quantity
                        }],
                        totalItems: 1,
                        totalQuantity: quantity,
                        totalPrice: pizzaItem.price
                    }
            };
            successMessage = 'New cart was added';
            logger.info(`{${reqUuid}} Insert new card item, cartItem={${cartItem}}`);
        }
        
        const newItem = new Cart(cartItem);

        await newItem.save((error) => {
            if(error) {
                logger.info(`{${reqUuid}} Exception Error: Could not insert new card item, error={${error}}`);
                return next(new AppError(500, 'Error', `Error occured!, Could not add item to cart`), req, res, next);   
            }
        });

        logger.info(`{${reqUuid}} Fill new cart with items process succeeded`);

        res.status(200).json({
            status: 'success',
            desc: successMessage,
            data: [
                newItem
            ]
        });
    } else {
        logger.error(`{${reqUuid}} Exception Error: Fill new cart with items process succeeded was failed, error={${error}}`);
        return next(new AppError(401, 'fail', `Could not add item to cart, product id - ${productId} was not found in the menu`), req, res, next);   
    }
}

exports.placeAnOrder = async (req, res, next) => {

    const reqUuid = uuid_v4();
    const {
        cartId,        
    } = req.body;

    logger.info(`{${reqUuid}} Place an order request`);

    const username = 'sk_test_4eC39HqLyjWDarjtT1zdp7dc';
    const stripeApiHost = process.env.STRIPE_API_HOST;
    const stripeApiPaymentUrlPath = process.env.STRIPE_API_PAYMENT_URL_PATH;

    const paymentMethod = 'card';
    const currency = 'usd';
    const paymentOrderId = '6735';


    if(!cartId) {
        logger.error(`{${reqUuid}} Validation Error: CartId parameter was not given`);
        return next(new AppError(401, 'fail', `cartId field is required !`), req, res, next);          
    }
    
    const isCartId = await Cart.findOne({
        'cart.cartId': cartId 
    });

    if(!isCartId) {
        logger.error(`{${reqUuid}} Validation Error: CartId was not found in database`);
        return next(new AppError(401, 'fail', `Order wasn't placed, Could not find the requested cart id - ${cartId}`), req, res, next);  
    }

    if (isCartId) {        
        const cartTotalPrice = Math.ceil(isCartId.cart.totalPrice);
        
        if(cartTotalPrice < 50) {
            logger.error(`{${reqUuid}} Validation Error: Cannot proceed with the payment process with amount under the limit: 50`);
            return next(new AppError(401, 'fail', `Payment validation error!, Cannot pay amount that is less then the limit: 50`), req, res, next);              
        }         

        let paymentStatus = 0;
        let paymentStatusDesc = 'Before payment';
        const orderId = Math.floor(Math.random() * 100);

        const orderItem = {
            order: {
                orderId: orderId,
                items: isCartId.cart.items,
                totalItems: isCartId.cart.totalItems,
                totalQuantity: isCartId.cart.totalQuantity,
                totalPrice: isCartId.cart.totalPrice,
                paymentStatus: paymentStatus,
                paymentProcess: paymentStatusDesc
            }
        };

        logger.info(`{${reqUuid}} Prepare new order item for insert: orderItem={${orderItem}}`);
    
        // Place new order in database
        const newOrderItem = Order(orderItem);
        newOrderItem.save((error) => {
            if(error) {        
                logger.error(`{${reqUuid}} Error occured!, Could not place an order new item, orderItem={${orderItem}}`);
                return next(new AppError(500, 'Error', `Error occured!, Could not place an order new item`), req, res, next);   
            }
        });

        logger.info(`{${reqUuid}} A New order was placed: orderItem={${orderItem}}`);
                 
        const stripeParameters = `?amount=${cartTotalPrice}&currency=${currency}&payment_method_types[]=${paymentMethod}&metadata[order_id]=${paymentOrderId}`;   
        
        logger.info(`{${reqUuid}} Prepare url parameter for Stripe api payment, stripeParameters={${stripeParameters}}`);

        https.request({
            host: stripeApiHost,
            path: stripeApiPaymentUrlPath + stripeParameters,
            method: 'POST',
            headers: {		
                "Authorization": "Basic " + new Buffer.from( username + ":" ).toString('base64')
            },
        }, (stripeRes) => {
            
            let stripeResponse = '';
            stripeRes.on('data',(chunk) => {            
                // collect chunk of the response data from Stripe api
                stripeResponse += chunk;
            });
            
            stripeRes.on('end',() => {
                logger.info(`{${reqUuid}} Stripe payment request ended`);

                // On end process, parse the stripeResponse response json message
                let paymentStatus = 0;                
                let paymentStatusDesc = 'Payment failed';
                
                if (stripeResponse !== undefined && stripeResponse.length > 0) {                    
                    const stripePament = JSON.parse(stripeResponse);                                
                    paymentStatus = (stripePament.error !== undefined) ? -1 : 1; 
                    paymentStatusDesc = (stripePament.error !== undefined) ? paymentStatusDesc : 'Payment success';                    
                }                              

                // Update order on payment status
                const updateOrderItem = new Order(newOrderItem);
                updateOrderItem.order.paymentStatus = paymentStatus;
                updateOrderItem.order.paymentStatusDesc = paymentStatusDesc;
                updateOrderItem.save((error) => {
                    if(error) {
                        logger.error(`{${reqUuid}} Error occured!, Could not update the order payment status, error={${error}}`);
                        return next(new AppError(500, 'Error', `Error occured!, Could not update the order payment status`), req, res, next);   
                    }        
                });   

                logger.info(`{${reqUuid}} A new order item placed successfuly, orderItem={${updateOrderItem}}`);
                
                res.status(200).json({
                    status: 'Success',
                    desc: 'New Order placed, and payment process success, Order id - ' + updateOrderItem.order.orderId,
                    data: null
                });
                return true;
            });

        }).end();        
    }
   
}