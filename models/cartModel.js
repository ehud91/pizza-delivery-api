const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    cart: {
        cartId: {
            type: Number,
            required: [true, 'Cart id filed is required, Please provide cart id']
        },
        items: [{ 
            productId: {
                type: Number,
                required: [false, '']
            },
            productName: {
                type: String,
                required: [false, '']
            },
            description: {
                type: String,
                required: [false, '']
            },
            price: {
                type: Number,
                required: [false, '']
            },
            quantity: {
                type: Number,
                required: [false, '']
            }
        }],
        totalItems: {
            type: Number,
            required: [false, '']
        },
        totalQuantity: {
            type: Number,
            required: [false, '']
        },
        totalPrice: {
            type: Number,
            required: [false, '']
        }
    }

});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;