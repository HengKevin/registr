import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AUTH_SERVICE } from '../constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { UserDto } from '../dto';
import { Reflector } from '@nestjs/core';

/**
 * Represents a guard that checks if a user has a valid JWT token before accessing protected resources.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  /**
   * Creates an instance of JwtAuthGuard.
   * @param authClient - An instance of the ClientProxy class that is injected into the JwtAuthGuard constructor.
   */
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Checks if the user has a valid JWT token.
   * @param context - The execution context.
   * @returns A boolean indicating if the user has a valid JWT token.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const jwt =
      context.switchToHttp().getRequest().cookies?.Authentication ||
      context.switchToHttp().getRequest().headers?.Authentication;
    if (!jwt) {
      return false;
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    return this.authClient
      .send<UserDto>('authenticate', {
        Authentication: jwt,
      })
      .pipe(
        tap((res) => {
          if (roles) {
            for (const role of roles) {
              if (!res.roles.includes(role)) {
                this.logger.error('The user does not have valid roles.');
                throw new UnauthorizedException();
              }
            }
          }

          context.switchToHttp().getRequest().user = res;
        }),
        map(() => true),
        catchError((error) => {
          this.logger.error(error);
          return of(false);
        }),
      );
  }
}
