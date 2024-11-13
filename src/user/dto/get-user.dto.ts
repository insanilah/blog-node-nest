import { IsUUID } from 'class-validator';

export class GetUserDTO {
    @IsUUID()
    id: string;
}
