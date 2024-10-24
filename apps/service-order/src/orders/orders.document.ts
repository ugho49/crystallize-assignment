import { WithId } from 'mongodb';
import { OrderStatus, PaymentCardType } from '@crystallize/common-types';

type Payment = {
  cardType: PaymentCardType;
  cardNumber: string;
  cardHolderName: string;
  expirationDate: string;
  cvv: string;
};

type Shipment = {
  firstname: string;
  lastname: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
};

export type OrderDocument = {
  userId: string;
  status: OrderStatus;
  createdAt: Date;
  totalAmount: number;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  payment: Payment;
  shipment: Shipment;
};

export type OrderDocumentWithId = WithId<OrderDocument>;

export type UpdateOrderDocument = {
  status?: OrderStatus;
  payment?: Payment;
  shipment?: Shipment;
};
