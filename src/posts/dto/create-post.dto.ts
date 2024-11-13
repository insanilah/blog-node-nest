import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class CreatePostDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsString()
    slug: string;

    @IsBoolean()
    published: boolean;

    @IsString()
    authorId: string;

    @IsArray()
    categoryIds: string[];

    @IsArray()
    tagIds: string[];
}
