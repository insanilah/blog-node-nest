import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { RedisModule } from 'src/redis/app.module';
import { UserActivityModule } from 'src/user-activity/user-activity.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisService } from 'src/redis/redis.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserActivityService } from 'src/user-activity/user-activity.service';
import { UserActivity, UserActivitySchema } from 'src/common/schemas/user-activity.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ARTICLE_QUEUE } from 'src/common/constants/rabbitmq.constant';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserActivity.name, schema: UserActivitySchema }]),
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',  // Nama yang digunakan untuk injeksi
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBIT_URI], // URL RabbitMQ
                    queue: ARTICLE_QUEUE,  // Nama queue yang didengarkan
                    persistent: true,
                    queueOptions: {
                        durable: true, // Menentukan apakah queue tahan terhadap restart RabbitMQ
                    },
                },
            },
        ]),
        UserActivityModule, RedisModule, PrismaModule, RabbitMQModule],
    controllers: [PostsController],
    providers: [PostsService, RedisService, PrismaService, UserActivityService, RabbitMQService],
})
export class PostsModule { }
