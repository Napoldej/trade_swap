import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TRADER')
  async rate(@Request() req: any, @Body() dto: CreateRatingDto) {
    return this.ratingService.rate(req.user.userId, dto);
  }
}
