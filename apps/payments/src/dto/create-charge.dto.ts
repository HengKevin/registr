import Stripe from 'stripe';

export class createChargeDto {
  card: Stripe.PaymentMethodCreateParams.Card1;
  amount: number;
}
