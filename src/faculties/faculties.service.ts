import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacultiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.faculties.findMany({
        select: {
          id_faculty: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Error fetching faculties:', error);
      throw new InternalServerErrorException(
        'Nu s-au putut încărca facultățile.',
      );
    }
  }

  /**
   * Returnează specializările asociate unei facultăți specifice.
   * Acestă metodă este crucială pentru a afișa datele corecte în profilul studentului.
   * @param facultyId ID-ul facultății pentru care se caută specializările.
   */
  async findSpecializationsByFaculty(facultyId: number) {
    try {
      // Pas 1: Verificăm dacă facultatea există pentru a preveni rezultate inconsistente
      const faculty = await this.prisma.faculties.findUnique({
        where: { id_faculty: facultyId },
      });

      if (!faculty) {
        throw new NotFoundException(
          `Facultatea cu ID-ul ${facultyId} nu a fost găsită.`,
        );
      }

      return await this.prisma.specializations.findMany({
        where: {
          faculty_id: facultyId,
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
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error(
        `Error fetching specializations for faculty ${facultyId}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Eroare la preluarea specializărilor.',
      );
    }
  }
}
