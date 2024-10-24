import { PaymentCardType } from '@crystallize/common-types';

export type OrderReceived = {
  orderId: string;
  userId: string;
  createdAt: Date;
  totalAmount: number;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  payment: {
    cardType: PaymentCardType;
    cardNumber: string;
    cardHolderName: string;
    expirationDate: string;
    cvv: string;
  };
  shipment: {
    firstname: string;
    lastname: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    phone: string;
  };
};
