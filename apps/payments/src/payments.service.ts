import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { NOTIFICATION_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaymentsCreateChargeDto } from './dto/payments-create-charge.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private readonly stripe = new Stripe(
    this.configService.get('STRIPE_SECRET_KEY'),
    {
      apiVersion: '2023-10-16',
    },
  );
  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {}

  async createCharge({ amount, email }: PaymentsCreateChargeDto) {
    // For live Mode
    // const paymentMethod = await this.stripe.paymentMethods.create({
    //   type: 'card',
    //   card,
    // });
    try {
      // this block here is configured for test mode, not charging real
      const paymentIntent = await this.stripe.paymentIntents.create({
        // payment_method: paymentMethod.id,
        // amount: amount * 100,
        // confirm: true,
        // payment_method_types: ['pm_card_visa'],
        // currency: 'gbp',
        amount: amount * 100,
        currency: 'gbp',
        payment_method: 'pm_card_visa',
      });

      this.notificationsService
        .emit('notify', {
          email: email,
          text: 'Payment Here',
        })
        .subscribe();
      this.logger.log(`charge created for email: ${email}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error creating charge: ${error.message}`);
    }
  }
}
