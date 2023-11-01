import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';
import { AUTH_SERVICE } from '../constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { UserDto } from '../dto';

/**
 * Represents a guard that checks if a user has a valid JWT token before accessing protected resources.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  /**
   * Creates an instance of JwtAuthGuard.
   * @param authClient - An instance of the ClientProxy class that is injected into the JwtAuthGuard constructor.
   */
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  /**
   * Checks if the user has a valid JWT token.
   * @param context - The execution context.
   * @returns A boolean indicating if the user has a valid JWT token.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const jwt = context.switchToHttp().getRequest().cookies?.Authentication;
    if (!jwt) {
      return false;
    }
    return this.authClient
      .send<UserDto>('authenticate', {
        Authentication: jwt,
      })
      .pipe(
        tap((res) => {
          context.switchToHttp().getRequest().user = res;
        }),
        map(() => true),
      );
  }
}
