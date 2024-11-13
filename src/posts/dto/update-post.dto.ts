import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsBoolean()
    published?: boolean;

    @IsOptional()
    @IsString()
    authorId?: string;

    @IsOptional()
    @IsArray()
    categoryIds?: string[];

    @IsOptional()
    @IsArray()
    tagIds?: string[];
}