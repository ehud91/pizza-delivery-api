const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    order: {
        orderId: {
            type: Number,
            required: [true, 'Order id filed is required, Please provide order id']
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
        },
        paymentStatus: {
            type: Number,
            required: [false, '']
        },
        paymentStatusDesc: {
            type: String,
            required: [false, '']
        }
    }

});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;