import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FacultiesService } from './faculties.service';

@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  // GET /faculties
  @Get()
  findAll() {
    return this.facultiesService.findAll();
  }

  // GET /faculties/:id/specializations
  @Get(':id/specializations')
  findSpecializations(@Param('id', ParseIntPipe) id_faculty: number) {
    return this.facultiesService.findSpecializationsByFaculty(id_faculty);
  }
}
