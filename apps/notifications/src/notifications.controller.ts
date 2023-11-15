import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotifyEmailDto } from './dto/notify-email.dto';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // event based microservice, EVENT PATTERN
  @UsePipes(new ValidationPipe())
  @EventPattern('notify')
  async notifyEmail(@Payload() data: NotifyEmailDto) {
    console.log('i was here');
    await this.notificationsService.notifyEmail(data);
  }
}
