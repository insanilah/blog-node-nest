// rabbitmq.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';
import { ARTICLE_QUEUE } from 'src/common/constants/rabbitmq.constant';
import { ConsumerController } from 'src/consumer/consumer.controller';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',  // Nama yang digunakan untuk injeksi
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBIT_URI], // URL RabbitMQ
                    queue: ARTICLE_QUEUE,  // Nama queue yang didengarkan
                    persistent:true,
                    queueOptions: {
                        durable: true, // Menentukan apakah queue tahan terhadap restart RabbitMQ
                    },
                },
            },
        ]),
    ],
    providers: [RabbitMQService],
    exports: [RabbitMQService],
    controllers:[ConsumerController],
})
export class RabbitMQModule { }
