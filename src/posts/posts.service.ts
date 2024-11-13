import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostDto } from './dto/post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserActivityService } from 'src/user-activity/user-activity.service';
import { ActivityType } from 'src/common/enums/activity-type.enum';
import { RedisService } from 'src/redis/redis.service';
import { Prisma } from '@prisma/client';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { ClientProxy } from '@nestjs/microservices';
import { ARTICLE_EXCHANGE, ARTICLE_ROUTING_KEY } from 'src/common/constants/rabbitmq.constant';

@Injectable()
export class PostsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userActivityService: UserActivityService,
        private readonly redisService: RedisService,
        private readonly rabbitMQService: RabbitMQService,
        @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy
    ) { }

    async publishMessage(exchange: string, routingKey: string, message: any) {
        this.client.emit({ exchange, routingKey }, message);
        console.log(`Message sent to exchange "${exchange}" with routing key "${routingKey}" and message: "${message}"`);
    }

    async publishArticleNotification(message: any) {
        await this.publishMessage(ARTICLE_EXCHANGE, ARTICLE_ROUTING_KEY, message);
    };

    async createPost(createPostDto: CreatePostDto) {
        const { title, content, slug, published, authorId, categoryIds, tagIds } = createPostDto;

        // Validasi input
        if (!title || !content || title.length < 10) {
            throw new BadRequestException("Bad Request", "Title and content are required, and title must be at least 10 characters.");
        }

        // Check for existing post title
        const existingTitle = await this.prisma.posts.findFirst({
            where: { title: { equals: title.trim().toLowerCase(), mode: Prisma.QueryMode.insensitive } },
        });
        if (existingTitle) {
            throw new BadRequestException("Bad Request", "Title already exists.");
        }

        // Create post
        const newPost = await this.prisma.posts.create({
            data: {
                title,
                content,
                slug,
                published,
                author_id: authorId,
                post_categories: { create: categoryIds.map(id => ({ category_id: id })) },
                post_tags: { create: tagIds.map(id => ({ tag_id: id })) },
            },
        });
        console.log("newPost:", newPost);
        
        await this.publishArticleNotification(newPost);
        return newPost;
    }

    async getAllPosts({ page, pageSize, query }) {
        const posts = await this.prisma.posts.findMany({
            where: { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                user: { select: { username: true } },
                post_categories: { select: { categories: { select: { name: true } } } },
                post_tags: { select: { tags: { select: { name: true } } } },
            },
        });

        return posts;

    }

    async getPostById(postId: string, req: any): Promise<any> {
        // 1. Catat aktivitas pengguna (misalnya: melihat post)
        const username = req.user.username;
        await this.userActivityService.createUserActivity(username, postId, ActivityType.VIEW);

        // 2. Cek cache Redis untuk post
        const cachedPost = await this.redisService.get(`post:${postId}`);
        if (cachedPost) {
            return JSON.parse(cachedPost);
        }

        // 3. Ambil data post dari database
        const post = await this.prisma.posts.findUnique({
            where: { id: postId },
            include: {
                user: { select: { id: true, username: true } },
                post_categories: { select: { categories: { select: { id: true, name: true } } } },
                post_tags: { select: { tags: { select: { id: true, name: true } } } }
            },
        });

        if (!post) {
            throw new NotFoundException("Bad Request", "Post not found.");
        }

        // 4. Formatkan data post
        const categories = post.post_categories.map(pc => pc.categories);
        const tags = post.post_tags.map(pt => pt.tags);

        const postModel = new PostDto(
            post.id,
            post.title,
            post.content,
            post.created_at,
            post.updated_at,
            post.slug,
            post.published,
            post.user,
            categories,
            tags
        );

        // 5. Simpan post ke cache Redis untuk 1 jam
        await this.redisService.set(`post:${postId}`, JSON.stringify(postModel), 3600);
        return postModel;
    }

    async updatePost(postId: string, updatePostDto: UpdatePostDto) {
        // Check if the post exists
        const existingPost = await this.prisma.posts.findUnique({ where: { id: postId } });
        if (!existingPost) {
            throw new NotFoundException("Not Found", "Post not found.");
        }

        // Check if a post with this title already exists (case-insensitive)
        const normalizedTitle = updatePostDto.title.trim().toLowerCase();
        const existingTitle = await this.prisma.posts.findFirst({
            where: {
                title: {
                    equals: normalizedTitle,
                    mode: Prisma.QueryMode.insensitive,
                }
            }
        });
        if (existingTitle) {
            throw new BadRequestException("Bad Request", "Title already exists.");
        }

        // Buat slug jika tidak ada
        let slug = updatePostDto.slug
        if (!slug) {
            slug = normalizedTitle
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter yang tidak diinginkan
                .trim()
                .replace(/\s+/g, '-') // Ganti spasi dengan "-"
                .substring(0, 50); // Batasi panjang slug
        }

        // Cek apakah slug sudah ada
        const existingSlug = await this.prisma.posts.findUnique({ where: { slug } });
        if (existingSlug) {
            throw new BadRequestException("Bad Request", "Slug already exists.");
        }

        // Update fields only if provided
        const updatedData = {
            title: updatePostDto.title || existingPost.title,
            content: updatePostDto.content || existingPost.content,
            slug: updatePostDto.slug || existingPost.slug,
            published: updatePostDto.published !== undefined ? updatePostDto.published : existingPost.published,
            author_id: updatePostDto.authorId || existingPost.author_id,
        };

        // Start the update transaction
        const updatedPost = await this.prisma.posts.update({
            where: { id: postId },
            data: {
                ...updatedData,
                post_categories: {
                    deleteMany: {}, // Clear existing categories
                    create: updatePostDto.categoryIds?.map(categoryId => ({ category_id: categoryId })) || [],
                },
                post_tags: {
                    deleteMany: {}, // Clear existing tags
                    create: updatePostDto.tagIds?.map(tagId => ({ tag_id: tagId })) || [],
                },
            },
            include: {
                user: { select: { id: true, username: true } },
                post_categories: { select: { categories: { select: { id: true, name: true } } } },
                post_tags: { select: { tags: { select: { id: true, name: true } } } },
            },
        });

        // Format the response data as a `Post` model
        const categories = updatedPost.post_categories.map(pc => pc.categories);
        const tags = updatedPost.post_tags.map(pt => pt.tags);
        const postModel = new PostDto(
            updatedPost.id,
            updatedPost.title,
            updatedPost.content,
            updatedPost.created_at,
            updatedPost.updated_at,
            updatedPost.slug,
            updatedPost.published,
            updatedPost.user,
            categories,
            tags
        );

        return postModel;
    }

    async deletePost(postId: string) {
        const existingPost = await this.prisma.posts.findUnique({ where: { id: postId } });
        if (!existingPost) {
            throw new NotFoundException("Not Found", "Post not found.");
        }

        // Hapus post beserta relasinya (categories dan tags)
        await this.prisma.posts.delete({
            where: { id: postId },
        });

        return
    }

}
