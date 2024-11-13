import { Module } from '@nestjs/common';
import { ConsumerController } from './consumer.controller';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ARTICLE_QUEUE } from 'src/common/constants/rabbitmq.constant';
import { ConsumerService } from './consumer.service';

@Module({
    imports: [
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
    ],
    // controllers: [ConsumerController],
    providers:[ConsumerService],
})
export class ConsumerModule { }
