import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserActivityDocument = HydratedDocument<UserActivity>;

@Schema({ collection: 'userActivity' })
export class UserActivity {
  @Prop({ required: true })
  username: string;

  @Prop({
    type: String,
    enum: ['create', 'view', 'like', 'comment', 'share', 'edit', 'delete', 'login', 'logout'],
    required: true,
  })
  activityType: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);

