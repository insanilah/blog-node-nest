import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserActivityModule } from './user-activity/user-activity.module';
import { PostsModule } from './posts/posts.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { ConfigModule } from '@nestjs/config';
import { ConsumerModule } from './consumer/consumer.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UserActivityModule,
    PostsModule,
    // RabbitMQModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ConsumerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

