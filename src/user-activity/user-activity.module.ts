import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserActivity, UserActivitySchema } from '../common/schemas/user-activity.schema';
import { UserActivityService } from './user-activity.service';
import { UserActivityController } from './user-activity.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserActivity.name, schema: UserActivitySchema }])],
  controllers: [UserActivityController],
  providers: [UserActivityService],
  exports:[UserActivityService],
})
export class UserActivityModule {}
