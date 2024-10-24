# Crystallize Assignment

## Description

You are tasked with building a backend service for an e-commerce platform that
handles order submissions. Upon receiving an order, the system must perform the
following actions:

1. Persist the Order
   Save the order details to a database for record-keeping and future reference.

2. Interact with External Services
   Send relevant order data to external services X, Y , and Z. These services handle payment
   processing, inventory management, and shipment scheduling tasks.
   Note: External services may have unpredictable and slow response times.

3. Notify the User
   Send a confirmation email to the user acknowledging receipt of their order.


There is no authentication implemented in this project. 
It is just a simple project to demonstrate the communication between services.

That's why the `POST /order` route is not protected and received the userId as a parameter instead of a token that include it in his payload.

## Workflow

The idea was to process payment/shipment/inventory in parallel using SNS topic and SQS queues.
But I realized that it would be better to process them in sequence since the payment service needs to know if the inventory service has the products available and the shipment service needs to know if the payment was successful.

The workflow is as follows:
- The client sends a POST request to the `/order` route with the order details.
  - The order is saved in the database.
  - The order is sent to the inventory service via SQS
  - An SQS message is sent to the mailer service to send an email to the user
- The inventory service processes the order
  - In case of success, the inventory service forward to the payment service via SQS
  - In case of failure, the inventory service update the order status to `out-of-stock` and send an email to the user via the mailer service
- The payment service processes
  - In case of success:
    - the payment service forward to the shipment service via SQS
    - the payment service update the order status to `payment-accepted`
  - In case of failure:
    - the payment service update the order status to `payment-rejected`
    - send an email to the user via the mailer service
- The shipment service processes the shipment and send an email to the user
  - update the order status to `shipped`
  - send an email to the user via the mailer service

Schema of the interaction between services:

<img src="./docs/assets/schema.jpg">

## Technologies

This project is a monorepo created with `Nx` (See https://nx.dev/).
It separates the apps and the libs in different folders.

All the apps are using `NestJS` and `Typescript`.
The tests are executed with Jest.

The database used is `MongoDB` and the communication between services is done with `SQS`.
In local, the SQS is emulated with `Localstack` (all the queues are created in the startup of the docker container).

## Structure

This project contains 5 apps:

- `service-order` (PORT **8080**): The main app that receives the order and send to the other services
- `service-inventory` (PORT **8081**): The service that process the inventory
- `service-payment` (PORT **8082**): The service that process the payment
- `service-shipment` (PORT **8083**): The service that process the shipment
- `service-mailer` (PORT **8084**): The service that send emails

Every service has its own database collection and the communication between them is done with SQS.
All the services are exposing a swagger documentation in the `/openapi` route.

## How to run

### Requirements

- Docker and Docker Compose
- Node 20+ / Pnpm

### Steps

1. Install the dependencies

```bash
pnpm install
```

2. Start docker containers

```bash
pnpm run docker:up
```

3. Start the services

```bash
pnpm run start
```

### Running the unit tests

```bash
pnpm run test
```

### Running the integrations tests

The integration tests are using the `TestContainers` library to start the docker containers before running the tests.
It is necessary to have the docker daemon running.

```bash
pnpm run test:int
```

### Create an order

In order to create an order, you need to send a POST request to the `http://localhost:8080/api/orders` route.

**Note:** All the services must be running in order to process the order.

```sh
curl -X POST 'http://localhost:8080/api/orders' \
  -H 'Content-Type: application/json' \
  -d '{
    "items": [
      {
        "productId": "apple-iphone-16-pro-black",
        "quantity": 1,
        "price": 1229.99
      },
      {
        "productId": "apple-airpod-pro",
        "quantity": 1,
        "price": 209.99
      }
    ],
    "totalAmount": 1439.98,
    "payment": {
      "cardType": "visa",
      "cardNumber": "1111 2222 3333 4444",
      "cardHolderName": "John Doe",
      "expirationDate": "11/27",
      "cvv": "123"
    },
    "shipment": {
      "firstname": "John",
      "lastname": "Doe",
      "address": "4 Privet Drive",
      "postalCode": "NW1 6XE",
      "city": "London",
      "country": "United Kingdom",
      "phone": "+447700900000"
    },
    "user": {
      "id": "1111111111111111",
      "email": "john@doe.com"
    }
  }'
```

## Not implemented

- The service-order app is currently not protected by any authentication mechanism.
- All the logic of the services (inventory, payment, shipment) is mocked.
- The mailer service is only capable of sending text emails and not html. Ideally, it could use an external service like Sendgrid or AWS SES.
