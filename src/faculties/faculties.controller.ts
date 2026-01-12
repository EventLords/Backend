import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Get()
  async findAll() {
    return this.facultiesService.findAll();
  }

  @Get(':id/specializations')
  async findSpecializations(@Param('id', ParseIntPipe) id_faculty: number) {
    return this.facultiesService.findSpecializationsByFaculty(id_faculty);
  }
}
