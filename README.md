# pizza-delivery-api

This project is an API application that should contains the following:

Users Api:
- Login user
- Signup user
- Delete user

Pizza Api:
- fetch all pizza items
- add item to cart
- place an order

## Getting Started

### Requirements
- [Git](https://git-scm.com/downloads)
- [Node.Js](https://nodejs.org/en/download/)
- [Npm - package manager](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Postman](https://www.postman.com/downloads/)

### Clone

To get started you can simply clone this repository using git:

```shell
$ git clone https://github.com/ehud91/pizza-delivery-api.git
$ cd pizza-delivery-api
```

### Application Installation

- Clone the repo by using git clone.
- Run npm install on the cloned directory.
- Edit the config.env file to suit your needs. ```(default port: 3003, default database: mongodb://localhost:27017/User, database is: "User")```

### Database Installation

- Install [MongoDB](https://beginnersbook.com/2017/09/how-to-install-and-configure-mongodb-for-windows/) on your local machine

### Running the application

- Run MongoDB on your local machine
- Run ```npm start```
- Go to ```http://localhost:3003/api/v1/users/login``` 

### Test the application

Go to your [Postman](https://www.postman.com/downloads/) and try all the services URI's 

### API Endpoints

Contains 2 main controllers api's:

- http://localhost:3003/api/v1/users/ - Users Controller 

- http://localhost:3003/api/v1/pizza/ - Pizza Controller

```Login api``` - Get username and password in order to validate login user
- http://localhost:3003/api/v1/users/login - POST method Only

```json
{
    "email": "example@gmail.com",
    "password": "1234"
}
```
```Signup api``` - Get the user details, in order to register the user
- http://localhost:3003/api/v1/users/signup - POST method Only

```json
{
    "name": "example_user",
    "email": "example@gmail.com",
    "password": "1234",
    "streetAddress": "20 Cooper Square, New York, NY 10003, USA",
    "passwordConfirm": "1234",
    "role": "admin"
}
```

```Delete api``` - Delete the user by email. find user by email, if exist remove the user
- http://localhost:3003/api/v1/users/delete - DELETE method Only

```json
{
    "email": "example@gmail.com"
}
```

(For the below requests - Authentication required! - Should add the Authorization Bearer token [the given JWT token])

```Get pizza items api``` - Get all pizza items from the menu 
- http://localhost:3003/api/v1/pizza/items - GET method Only 

```Add items to cart api``` - Add new Item to the cart, if cart is already exist by id - add the product as item to the cart
if it's a new cart, create new cart and save it
- http://localhost:3003/api/v1/pizza/addCartItem

```json
{
    "cartId": 2,
    "productId": 3,
    "quantity": 3
}
```

```Place an order api``` - Place new order by an open cart id, check if cart id exist and convert it to a new order, and run the payment process 
by Stripe API
- http://localhost:3003/api/v1/pizza/placeAnOrder

```json
{
    "cartId": 5
}
```
