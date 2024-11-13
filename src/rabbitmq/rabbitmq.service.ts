// rabbitmq.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { ARTICLE_EXCHANGE, ARTICLE_QUEUE, ARTICLE_ROUTING_KEY, USER_EXCHANGE, USER_QUEUE, USER_ROUTING_KEY } from 'src/common/constants/rabbitmq.constant';
import { json } from 'stream/consumers';

@Injectable()
export class RabbitMQService {
    constructor(@Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy) { }

    async publishMessage(exchange: string, routingKey: string, message: any) {
        this.client.send({ exchange, routingKey }, message).subscribe({
            next: (response) => {
                console.log("Response from consumersss:", response);
            },
            error: (err) => {
                console.error("Error:", err);
            },
        });

        console.log(`Message sent to exchange "${exchange}" with routing key "${routingKey}" and message: "${message}"`);
    }

    async publishArticleNotification(message: any) {
        await this.publishMessage(ARTICLE_EXCHANGE, ARTICLE_ROUTING_KEY, message);
    };

    async publishUserRegistration(message: any) {
        await this.publishMessage(USER_EXCHANGE, USER_QUEUE, message);
    };

}

