import { IsString, IsUUID, IsBoolean, IsArray, IsOptional, IsDate } from 'class-validator';

export class PostDto {
    @IsUUID()
    id: string;

    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsString()
    slug: string;

    @IsBoolean()
    published: boolean;

    @IsOptional()
    author: { id: string; username: string };

    @IsArray()
    categories: { id: string; name: string }[];

    @IsArray()
    tags: { id: string; name: string }[];

    constructor(
        id: string,
        title: string,
        content: string,
        createdAt: Date,
        updatedAt: Date,
        slug: string,
        published: boolean,
        author: { id: string; username: string },
        categories: { id: string; name: string }[],
        tags: { id: string; name: string }[]
    ) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.slug = slug;
        this.published = published;
        this.author = author;
        this.categories = categories;
        this.tags = tags;
    }
}
