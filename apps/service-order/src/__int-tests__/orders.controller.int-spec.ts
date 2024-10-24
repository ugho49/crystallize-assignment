import { useTestApp } from './utils/use-test-app';
import { ObjectId } from 'mongodb';

describe('OrdersController', () => {
  const { getRequest, getMongoClient } = useTestApp();

  describe('POST /api/orders', () => {
    it('should fails if some params are missing', async () => {
      await getRequest()
        .post('/api/orders')
        .send({})
        .expect(400)
        .expect(({ body }) =>
          expect(body).toMatchObject({ message: 'Validation failed' })
        );
    });

    it('should create order in db and emit sqs messages', async () => {
      const ordersCollection = getMongoClient().collection('orders');
      expect(await ordersCollection.countDocuments()).toBe(0);

      await getRequest()
        .post('/api/orders')
        .send({
          items: [
            {
              productId: 'apple-iphone-16-pro-black',
              quantity: 1,
              price: 1229.99,
            },
            {
              productId: 'apple-airpod-pro',
              quantity: 1,
              price: 209.99,
            },
          ],
          totalAmount: 1439.98,
          payment: {
            cardType: 'visa',
            cardNumber: '1111 2222 3333 4444',
            cardHolderName: 'John Doe',
            expirationDate: '11/27',
            cvv: '123',
          },
          shipment: {
            firstname: 'John',
            lastname: 'Doe',
            address: '4 Privet Drive',
            postalCode: 'NW1 6XE',
            city: 'London',
            country: 'United Kingdom',
            phone: '+447700900000',
          },
          user: {
            id: '1111111111111111',
            email: 'john@doe.com',
          },
        })
        .expect(201)
        .expect(({ body }) =>
          expect(body).toEqual({ orderId: expect.toBeString() })
        );

      expect(await ordersCollection.countDocuments()).toBe(1);
      expect(await ordersCollection.findOne()).toEqual({
        _id: expect.any(ObjectId),
        createdAt: expect.toBeDate(),
        items: [
          {
            productId: 'apple-iphone-16-pro-black',
            quantity: 1,
            price: 1229.99,
          },
          {
            productId: 'apple-airpod-pro',
            quantity: 1,
            price: 209.99,
          },
        ],
        totalAmount: 1439.98,
        status: 'created',
        payment: {
          cardType: 'visa',
          cardNumber: '1111222233334444',
          cardHolderName: 'John Doe',
          expirationDate: '11/27',
          cvv: '123',
        },
        shipment: {
          firstname: 'John',
          lastname: 'Doe',
          address: '4 Privet Drive',
          postalCode: 'NW1 6XE',
          city: 'London',
          country: 'United Kingdom',
          phone: '+447700900000',
        },
        userId: '1111111111111111',
      });

      // TODO: assert that the sqs messages were emitted
    });
  });
});
