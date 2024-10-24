import { GetOrderDtoOutput } from './orders.dto';
import { OrderDocumentWithId } from './orders.document';

export function mapDocumentToGetOrderDtoOutput(
  document: OrderDocumentWithId
): GetOrderDtoOutput {
  return {
    items: document.items,
    totalAmount: document.totalAmount,
    shipment: document.shipment,
    createdAt: document.createdAt,
    status: document.status,
    payment: {
      cardType: document.payment.cardType,
      cardNumber: maskCreditCard(document.payment.cardNumber),
    },
  };
}

export function maskCreditCard(cardNumber: string) {
  if (cardNumber.length !== 16) return cardNumber;

  const n = cardNumber.length;

  // splice the last four characters
  const lastFour = cardNumber.slice(-4);
  const remaining = cardNumber.slice(0, n - 4);

  // mask the remaining numbers with asterisks
  return '*'.repeat(remaining.length) + lastFour;
}
