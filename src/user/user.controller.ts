import { Controller, Post, Body, Get, UseGuards, Param, UnauthorizedException, Query, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseApi } from 'src/common/dto/response-api.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUserDTO } from 'src/user/dto/get-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getUserByEmail(@Param() getUserDTO: GetUserDTO) {
        const user = await this.userService.getUserById(getUserDTO.id);
        return new ResponseApi(200, 'User found', user);
    }

    @Get('/')
    @UseGuards(JwtAuthGuard)
    async findAllUser(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('searchTerm') searchTerm: string = '',
    ) {
      const response = await this.userService.getAllUsers(page, limit, searchTerm);
      return new ResponseApi(HttpStatus.OK, 'Success', response);
    }
  
    @Get('/:id')    
    @UseGuards(JwtAuthGuard)
    async getUserById(@Param('id') id: string) {
      const response = await this.userService.getUserById(id);
      return new ResponseApi(HttpStatus.OK, 'Success', response);
    }
}
