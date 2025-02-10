import { Controller, Post, Body, Get, Query, UseGuards, UnauthorizedException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { ResponseApi } from 'src/common/dto/response-api.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Throttle } from "@nestjs/throttler";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDTO: RegisterDTO) {
        const user = await this.authService.registerUser(registerDTO);
        return new ResponseApi(201, 'User registered successfully', user);
    }

    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Maksimal 5 request per menit
    async login(@Body() loginDTO: LoginDTO) {
        const token = await this.authService.loginUser(loginDTO);

        if (!token) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return new ResponseApi(200, 'Login successfully', token);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req: RequestWithUser) {
        // Tidak perlu menambahkan logika di sini; proses autentikasi dimulai otomatis
        // `req.user` akan berisi data pengguna setelah autentikasi berhasil
        console.log(req.user); // Menampilkan user yang terautentikasi
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: RequestWithUser) {
        if (!req.user) {
            throw new UnauthorizedException('Invalid user credentials');
        }
        const user = await this.authService.findOrCreateUser({
            providerId: req.user.id,
            email: req.user.email,
            name: req.user.name,
        });
        const data = this.authService.generateAndCreateObjectToken(user);
        return new ResponseApi(200, 'Login successfully', data);
    }

}
