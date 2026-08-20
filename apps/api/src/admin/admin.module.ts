import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MenuModule } from '../menu/menu.module';
import { RedisModule } from '../redis/redis.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, MenuModule, RedisModule, JwtModule, UploadModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
