// article.consumer.ts (Manual setup with amqplib)
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import * as amqplib from 'amqplib';
import { ARTICLE_QUEUE, ARTICLE_ROUTING_KEY } from 'src/common/constants/rabbitmq.constant';
import { PostDto } from 'src/posts/dto/post.dto';

@Injectable()
export class ConsumerService implements OnModuleInit {
    private channel: any;

    async onModuleInit() {
        const connection = await amqplib.connect(process.env.RABBIT_URI);
        this.channel = await connection.createChannel();
        await this.channel.assertQueue(ARTICLE_QUEUE, { durable: true });

        this.channel.consume(ARTICLE_QUEUE, (msg: any) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                console.log('Received article notification:', data);
                this.channel.ack(msg);
            }
        });
    }

    // @EventPattern(ARTICLE_QUEUE)
    // handleArticlePublished(@Payload() data: PostDto, @Ctx() context: RmqContext) {
    //     const channel = context.getChannelRef();
    //     const originalMessage = context.getMessage();

    //     console.log('Received article notification:', data);
    //     // Acknowledge message processing
    //     channel.ack(originalMessage);
    // }

}
