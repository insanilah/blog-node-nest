import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { LoginDTO } from './dto/login.dto';
import { UserDTO } from 'src/user/dto/user.dto';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';
import { generatePassword, hashedPassword } from 'src/common/utils/password.utils';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    // Method untuk generate token
    generateToken(user: { id: string; username: string; email: string }): string {
        return jwt.sign(
            { userId: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET || 'defaultSecret', // Gunakan default untuk development
            { expiresIn: '1h' } // Tentukan waktu kadaluarsa token
        );
    }

    // Method untuk mengembalikan token dalam bentuk objek
    createObjectToken(token: string) {
        return { accessToken: token };
    }

    generateAndCreateObjectToken(user: { id: string; username: string; email: string }) {
        const token = this.generateToken(user);
        return this.createObjectToken(token);
    }

    async registerUser(createUserDTO: CreateUserDTO) {
        const hashedPassword = await bcrypt.hash(createUserDTO.password, 10);

        const role = await this.prisma.roles.findUnique({
            where: { role_name: 'member' },
        });

        if (!role) {
            throw new BadRequestException('Role "member" not found');
        }

        const user = await this.prisma.users.create({
            data: {
                email: createUserDTO.email,
                password: hashedPassword,
                username: createUserDTO.username,
                name: createUserDTO.name,
                roles: { connect: { id: role.id } },
            },
            include: { roles: true },
        });

        return new UserDTO(user);
    }

    async loginUser(loginDTO: LoginDTO): Promise<{ accessToken: string }> {
        const { email, password } = loginDTO;
        const user = await this.prisma.users.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateAndCreateObjectToken(user);
    }


    async findOrCreateUser(profile: { providerId: string; email: string; name: string }) {
        let user = await this.prisma.users.findUnique({
            where: { email: profile.email },
        });

        if (!user) {
            const passwordGenerate = generatePassword();
            const password = await hashedPassword(passwordGenerate);
            
            const role = await this.prisma.roles.findUnique({ where: { role_name: 'member' } });
            user = await this.prisma.users.create({
                data: {
                    email: profile.email,
                    name: profile.name,
                    password,
                    roles: { connect: { id: role.id } },
                },
            });
        }

        return new UserDTO(user);
    }
}
