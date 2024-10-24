import { OrderStatus } from '@crystallize/common-types';

export type UpdateOrderStatus = {
  orderId: string;
  newStatus: OrderStatus;
};
