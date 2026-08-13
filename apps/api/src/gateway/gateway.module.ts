import { Module } from '@nestjs/common';
import { OrdersGateway } from './orders.gateway';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [OrdersGateway],
  exports: [OrdersGateway],
})
export class GatewayModule {}
