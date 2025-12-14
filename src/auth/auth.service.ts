import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterOrganizerDto } from './dto/register-organizer.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // --------------------------------------------------------
  // REGISTER STUDENT
  // --------------------------------------------------------
  async registerStudent(dto: RegisterStudentDto) {
    // 1. verificăm dacă email-ul există
    const existing = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Există deja un cont cu acest e-mail.');
    }

    // 2. hash parola
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. email USV? → auto-approved
    const isUSVemail =
      dto.email.toLowerCase().endsWith('@usv.ro') ||
      dto.email.toLowerCase().endsWith('@student.usv.ro');

    // 4. creăm studentul
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

        isApproved: isUSVemail ? true : false,
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

    return student;
  }

  // --------------------------------------------------------
  // REGISTER ORGANIZER
  // --------------------------------------------------------
  async registerOrganizer(dto: RegisterOrganizerDto) {
    // 1. verificăm dacă email-ul există deja
    const existing = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Există deja un cont cu acest e-mail.');
    }

    // 2. hash parola
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. creăm organizatorul (NEAPROBAT)
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

        isApproved: false, // adminul îl aprobă
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
        created_at: true,
      },
    });

    return organizer;
  }

  // --------------------------------------------------------
  // LOGIN (student / organizer / admin)
  // --------------------------------------------------------
  async login(dto: LoginDto) {
    // 1. verificăm dacă user-ul există
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Email sau parolă incorectă.');
    }

    // 2. verificăm parola
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Email sau parolă incorectă.');
    }

    // 3. dacă este organizator și NU este aprobat → blocăm login-ul
    if (user.role === 'ORGANIZER' && !user.isApproved) {
      throw new BadRequestException(
        'Contul tău de organizator este în curs de aprobare.',
      );
    }

    // STUDENT neaprobat? → blocăm login-ul
    if (user.role === 'STUDENT' && !user.isApproved) {
      throw new BadRequestException(
        'Contul tău de student nu a fost aprobat încă.',
      );
    }

    // 4. generăm token JWT corect
    const payload = {
      sub: user.id_user, // standard JWT subject
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
