import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { ConfigurableModuleClass } from '@nestjs/common/cache/cache.module-definition';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {
  // abstracting the module initialization
  static forFeature(models: ModelDefinition[]) {
    return MongooseModule.forFeature(models);
  }
}
