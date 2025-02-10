import { Controller, Post, Get, Param, Body, Query, Put, Delete, Req, Request, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ResponseApi } from 'src/common/dto/response-api.dto';
import axios from 'axios';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
    constructor(private readonly postService: PostsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createPost(@Body() createPostDto: CreatePostDto) {
        const response = await this.postService.createPost(createPostDto);
        return new ResponseApi(201, "Post created successfully", response);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAllPosts(
        @Query('page') page = '1',
        @Query('limit') pageSize = '10',
        @Query('query') query = ''
    ) {
        const pageNumber = parseInt(page, 10);
        const limit = parseInt(pageSize, 10);

        const response = await this.postService.getAllPosts({ page: pageNumber, pageSize: limit, query });
        return new ResponseApi(200, "Posts retrieved successfully", response);
    }

    @Get('external-api')
    @UseGuards(JwtAuthGuard)
    async fetchPosts() {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
        return new ResponseApi(200, "Get post external API successfully", response.data);
    }

    @Get(':postId')
    @UseGuards(JwtAuthGuard)
    async getPostById(@Param('postId') postId: string, @Request() req: RequestWithUser) {
        const response = await this.postService.getPostById(postId, req);
        return new ResponseApi(200, "Post retrieved successfully", response);
    }

    @Put(':postId')
    @UseGuards(JwtAuthGuard)
    async updatePost(@Param('postId') postId: string, @Body() updatePostDto: UpdatePostDto) {
        const response = await this.postService.updatePost(postId, updatePostDto);
        return new ResponseApi(200, "Post updated successfully", response);
    }

    @Delete(':postId')
    @UseGuards(JwtAuthGuard)
    async deletePost(@Param('postId') postId: string) {
        await this.postService.deletePost(postId);
        return new ResponseApi(200, "Post deleted successfully");
    }
}
