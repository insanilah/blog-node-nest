import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, RmqOptions, Transport } from '@nestjs/microservices';
import { ARTICLE_QUEUE } from './common/constants/rabbitmq.constant';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: ['amqp://guest:guest@localhost:5672'],
  //     queue: ARTICLE_QUEUE,
  //     queueOptions: {
  //       durable: false
  //     },
  //   },
  // });
  // app.listen();

  // const apps = await NestFactory.create(AppModule);

  // // Mengaktifkan validasi global
  // apps.useGlobalPipes(new ValidationPipe({
  //   transform: true, // Mengubah data ke tipe yang sesuai di DTO
  //   whitelist: true, // Menghapus properti yang tidak ada di DTO
  // }));

  // await apps.listen(process.env.PORT ?? 8080);

  const app = await NestFactory.create(AppModule);

  // app.connectMicroservice<RmqOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [process.env.RABBIT_URI],
  //     queue: ARTICLE_QUEUE,
  //     queueOptions: { durable: true },
  //   },
  // });

  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Mengubah data ke tipe yang sesuai di DTO
    whitelist: true, // Menghapus properti yang tidak ada di DTO
  }));


  // await app.startAllMicroservices();

  // Mengaktifkan CORS
  app.enableCors({
    // origin: 'http://localhost:3000', // Ganti sesuai origin frontend Anda
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(8080);
}


bootstrap();
