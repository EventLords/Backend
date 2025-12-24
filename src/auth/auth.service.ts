import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterOrganizerDto } from './dto/register-organizer.dto';
import { LoginDto } from './dto/login.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  // --------------------------------------------------------
  // REGISTER STUDENT
  // --------------------------------------------------------
  async registerStudent(dto: RegisterStudentDto) {
    const existing = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Există deja un cont cu acest e-mail.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const isUSVemail =
      dto.email.toLowerCase().endsWith('@usv.ro') ||
      dto.email.toLowerCase().endsWith('@student.usv.ro');

    const student = await this.prisma.users.create({
      data: {
        email: dto.email,
        password_hash: passwordHash,
        role: 'STUDENT',

        first_name: dto.firstName,
        last_name: dto.lastName,

        faculty_id: dto.facultyId,
        specialization_id: dto.specializationId,
        study_cycle: dto.studyCycle,
        study_year: dto.studyYear ?? null,

        isApproved: isUSVemail,
      },
      select: {
        id_user: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        faculty_id: true,
        specialization_id: true,
        study_cycle: true,
        study_year: true,
        isApproved: true,
        created_at: true,
      },
    });

    await this.notificationsService.createNotification({
      userId: student.id_user,
      type: NotificationType.ACCOUNT_CREATED,
      title: 'Bine ai venit!',
      message: 'Contul tău de student a fost creat cu succes.',
    });

    return student;
  }

  // --------------------------------------------------------
  // REGISTER ORGANIZER
  // --------------------------------------------------------
  async registerOrganizer(dto: RegisterOrganizerDto) {
    const existing = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Există deja un cont cu acest e-mail.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const organizer = await this.prisma.users.create({
      data: {
        email: dto.email,
        password_hash: passwordHash,
        role: 'ORGANIZER',

        first_name: dto.firstName,
        last_name: dto.lastName,
        phone: dto.phone,

        organization_type: dto.organizationType,
        organization_name: dto.organizationName ?? null,
        organization_description: dto.organizationDescription,

        isApproved: false,
        isRejected: false,
      },
      select: {
        id_user: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        phone: true,
        organization_type: true,
        organization_name: true,
        organization_description: true,
        isApproved: true,
        isRejected: true,
        created_at: true,
      },
    });
    const admins = await this.prisma.users.findMany({
      where: { role: 'ADMIN' },
      select: { id_user: true },
    });

    for (const admin of admins) {
      const exists = await this.prisma.notifications.findFirst({
        where: {
          user_id: admin.id_user,
          event_id: organizer.id_user, // 👈 FOARTE IMPORTANT
          type: NotificationType.ADMIN_ORGANIZER_PENDING,
          read_at: null,
        },
      });

      if (!exists) {
        await this.notificationsService.createNotification({
          userId: admin.id_user,
          type: NotificationType.ADMIN_ORGANIZER_PENDING,
          title: 'Cerere nouă de organizer',
          message: `Un nou organizer (${organizer.email}) a cerut aprobarea contului.`,
        });
      }
    }

    return organizer;
  }

  // --------------------------------------------------------
  // LOGIN (FIXAT CORECT)
  // --------------------------------------------------------
  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Email sau parolă incorectă.');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Email sau parolă incorectă.');
    }

    // ✅ ORGANIZER REJECTED
    if (user.role === 'ORGANIZER' && user.isRejected) {
      throw new BadRequestException(
        `Contul tău a fost respins. Motiv: ${
          user.rejection_reason ?? 'Nespecificat'
        }`,
      );
    }

    // ✅ ORGANIZER PENDING
    if (user.role === 'ORGANIZER' && !user.isApproved) {
      throw new BadRequestException(
        'Contul tău de organizator este în curs de aprobare.',
      );
    }

    // ✅ STUDENT PENDING
    if (user.role === 'STUDENT' && !user.isApproved) {
      throw new BadRequestException(
        'Contul tău de student nu a fost aprobat încă.',
      );
    }

    const payload = {
      sub: user.id_user,
      role: user.role,
      isApproved: user.isApproved,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Autentificare reușită.',
      token,
      user: {
        id_user: user.id_user,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    };
  }
}
