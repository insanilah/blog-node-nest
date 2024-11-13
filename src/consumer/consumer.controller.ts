import { Controller, Injectable } from "@nestjs/common";
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { ARTICLE_ROUTING_KEY, USER_ROUTING_KEY } from "src/common/constants/rabbitmq.constant";
import { PostDto } from "src/posts/dto/post.dto";

@Controller()
export class ConsumerController {
  @EventPattern(ARTICLE_ROUTING_KEY)
  handleArticlePublished(@Payload() data: PostDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    console.log('Received article notification:', data);
    // Acknowledge message processing
    channel.ack(originalMessage);
  }

  // @EventPattern(ARTICLE_ROUTING_KEY)  // Sesuaikan dengan routing key
  // async handleArticlePublished(@Payload() message: any) {
  //   console.log('Received article published message:', message);
  // }

  @EventPattern(USER_ROUTING_KEY)
  handleRegisterPublished(data: any) {
    console.log('Received user notification:', data);
  }
}