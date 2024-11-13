import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDTO } from './dto/user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async getUserById(id: string): Promise<UserDTO | null> {
        const user = await this.prisma.users.findUnique({ where: { id }, include: { roles: true } });

        if (!user) {
            throw new NotFoundException('Not Found', 'User not found');
        }

        return new UserDTO(user);
    }

    async getAllUsers(page: number, limit: number, searchTerm: string) {
        const skip = (page - 1) * limit;

        const where = searchTerm
        ? {
            OR: [
              { email: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
              { username: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
              { name: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {};

        const users = await this.prisma.users.findMany({
            where,
            skip,
            take: limit,
            include: { roles: true },
        });

        const totalUsers = await this.prisma.users.count();
        const totalPages = Math.ceil(totalUsers / limit);

        const userModels = users.map(
            (user) =>
                new UserDTO(user),
        );

        return {
            currentPage: page,
            totalPages,
            totalUsers,
            users: userModels,
        };
    }

}
