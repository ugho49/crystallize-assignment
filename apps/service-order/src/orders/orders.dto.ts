import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaymentCardType, OrderStatus } from '@crystallize/common-types';

const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  price: z.number().positive(),
});

const UserInfoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

const ShipmentInfoSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  address: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
  phone: z.string(),
});

const PaymentInfoSchema = z.object({
  cardType: z.nativeEnum(PaymentCardType),
  cardNumber: z
    .string()
    .transform((value) => value.replace(/\s+/g, ''))
    .pipe(z.string().length(16)),
  cardHolderName: z.string(),
  expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/), // Format MM/YY
  cvv: z.string().length(3),
});

const SubmitOrderSchema = z.object({
  items: z.array(OrderItemSchema).nonempty(),
  totalAmount: z.number().positive(),
  payment: PaymentInfoSchema,
  shipment: ShipmentInfoSchema,
  user: UserInfoSchema, // In a real app, this would be encapsulated in a JWT token and not passed in the request body
});

export class SubmitOrderDto extends createZodDto(SubmitOrderSchema) {}

export class SubmitOrderDtoOutput {
  orderId: string;
}

export class GetOrderDtoOutput {
  status: OrderStatus;
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
}
