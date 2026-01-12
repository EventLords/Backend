import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  private getUserId(req: any): number {
    return Number(req.user.id);
  }

  @Get('me')
  async getMyRecommendations(@Req() req: any) {
    return this.service.getRecommendationsForUser(this.getUserId(req));
  }
}
