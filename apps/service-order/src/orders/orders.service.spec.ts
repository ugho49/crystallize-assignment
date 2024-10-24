import { Test } from '@nestjs/testing';
import { SqsProducerService } from '@crystallize/sqs';
import { createMock } from '@golevelup/ts-jest';

import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';
import ordersConfig from './orders.config';
import { ConfigType } from '@nestjs/config';
import { SubmitOrderDto } from './orders.dto';
import { PaymentCardType } from '@crystallize/common-types';

const mockOrdersRepository = createMock<OrdersRepository>();
const mockSqsProducerService = createMock<SqsProducerService>();
const mockConfigService: ConfigType<typeof ordersConfig> = {
  MAILER_SEND_EMAIL_QUEUE_URL: 'mailer-send-email-queue-url',
  INVENTORY_ORDER_RECEIVED_QUEUE_URL: 'inventory-order-received-queue-url',
  ORDER_UPDATE_STATUS_QUEUE_URL: 'order-update-status-queue-url',
};

describe('OrdersService', () => {
  let ordersService: OrdersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: mockOrdersRepository },
        { provide: SqsProducerService, useValue: mockSqsProducerService },
        { provide: ordersConfig.KEY, useValue: mockConfigService },
      ],
    }).compile();

    ordersService = moduleRef.get<OrdersService>(OrdersService);
  });

  describe('submitOrder', () => {
    it('should submit an order and send it to the inventory and mailer queues', async () => {
      // Given
      const order: SubmitOrderDto = {
        user: { id: 'user-id', email: 'john@doe.com' },
        items: [
          { productId: 'product-id', price: 10, quantity: 1 },
          { productId: 'product-id-2', price: 20, quantity: 2 },
        ],
        totalAmount: 50,
        payment: {
          cardType: PaymentCardType.Visa,
          cvv: '123',
          cardNumber: '1234567812345678',
          cardHolderName: 'John Doe',
          expirationDate: '12/23',
        },
        shipment: {
          firstname: 'John',
          lastname: 'Doe',
          address: '123 Main St',
          postalCode: '12345',
          city: 'Springfield',
          country: 'USA',
          phone: '1234567890',
        },
      };

      mockOrdersRepository.createOrder.mockResolvedValueOnce('order-id');

      // When
      const res = await ordersService.submitOrder(order);

      // Then
      expect(res).toBe('order-id');
      expect(mockOrdersRepository.createOrder).toHaveBeenCalledWith({
        items: [
          { productId: 'product-id', price: 10, quantity: 1 },
          { productId: 'product-id-2', price: 20, quantity: 2 },
        ],
        totalAmount: 50,
        payment: {
          cardType: PaymentCardType.Visa,
          cvv: '123',
          cardNumber: '1234567812345678',
          cardHolderName: 'John Doe',
          expirationDate: '12/23',
        },
        createdAt: expect.any(Date),
        status: 'created',
        userId: 'user-id',
        shipment: {
          firstname: 'John',
          lastname: 'Doe',
          address: '123 Main St',
          postalCode: '12345',
          city: 'Springfield',
          country: 'USA',
          phone: '1234567890',
        },
      });
      expect(mockSqsProducerService.sendObject).toHaveBeenCalledTimes(2);
      expect(mockSqsProducerService.sendObject).toHaveBeenNthCalledWith(
        1,
        'inventory-order-received-queue-url',
        {
          orderId: 'order-id',
          userId: 'user-id',
          payment: {
            cardType: PaymentCardType.Visa,
            cvv: '123',
            cardNumber: '1234567812345678',
            cardHolderName: 'John Doe',
            expirationDate: '12/23',
          },
          totalAmount: 50,
          createdAt: expect.toBeDateString(),
          items: [
            { productId: 'product-id', price: 10, quantity: 1 },
            { productId: 'product-id-2', price: 20, quantity: 2 },
          ],
          shipment: {
            firstname: 'John',
            lastname: 'Doe',
            address: '123 Main St',
            postalCode: '12345',
            city: 'Springfield',
            country: 'USA',
            phone: '1234567890',
          },
        }
      );
      expect(mockSqsProducerService.sendObject).toHaveBeenNthCalledWith(
        2,
        'mailer-send-email-queue-url',
        {
          to: 'john@doe.com',
          eventType: 'order.created',
          metadata: {
            orderId: 'order-id',
            createdAt: expect.toBeDateString(),
            totalAmount: 50,
            items: [
              { productId: 'product-id', price: 10, quantity: 1 },
              { productId: 'product-id-2', price: 20, quantity: 2 },
            ],
          },
        }
      );
    });
  });
});
