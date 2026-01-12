import {
  Controller,
  Get,
  Patch,
  Req,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getMyProfile(@Req() req) {
    return this.profileService.getMyProfile(req.user.id);
  }

  @Patch('me')
  updateMyProfile(@Req() req, @Body() dto: any) {
    return this.profileService.updateMyProfile(req.user, dto);
  }

  @Patch('change-password')
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.profileService.changePassword(req.user.id, dto);
  }
 
  @Delete('me')
  deleteMyAccount(@Req() req) {
    return this.profileService.deleteMyAccount(req.user.id);
  }
}
