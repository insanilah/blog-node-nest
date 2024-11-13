import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserActivityService } from './user-activity.service';
import { GetUserActivitiesDto } from './dto/user-activity.dto';
import { ResponseApi } from 'src/common/dto/response-api.dto';

@Controller('user-activities')
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @Get('/:username')
  @UseGuards(JwtAuthGuard)
  async getUserActivitiesByUsername(@Param('username') username: string) {
    const response = await this.userActivityService.getUserActivitiesByUsername(username);
    return new ResponseApi(200, 'User activity retrieved successfully', response);
  }

  @Get('summary/:username')
  @UseGuards(JwtAuthGuard)
  async aggregateUserActivitiesSortedByDay(@Param('username') username: string) {
    const response = await this.userActivityService.aggregateUserActivitiesSortedByDay(username);
    return new ResponseApi(200, 'Summary user activity retrieved successfully', response);
  }
}
