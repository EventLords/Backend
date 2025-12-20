import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacultiesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.faculties.findMany({
      select: {
        id_faculty: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  findSpecializationsByFaculty(facultyId: number) {
    return this.prisma.specializations.findMany({
      where: {
        faculty_id: facultyId, // ✅ NUMELE CORECT DIN SCHEMA
      },
      select: {
        id_specialization: true,
        name: true,
        study_cycle: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
