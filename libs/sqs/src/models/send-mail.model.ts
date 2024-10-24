export enum EventType {
  OrderCreated = 'order.created',
  OrderOutOfStock = 'order.out-of-stock',
  OrderShipped = 'order.shipped',
}

export type SendMail = {
  to: string | string[];
  eventType: EventType;
  metadata: Record<string, unknown>;
};
