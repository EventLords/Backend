import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { UpdateStudentDto } from './dto/update-student.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getMyProfile(userId: number) {
    return this.prisma.users.findUnique({
      where: { id_user: userId },
      select: {
        id_user: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        phone: true,
        organization_name: true,
        organization_type: true,
        organization_description: true,
        faculty_id: true,
        specialization_id: true,
        study_cycle: true,
        study_year: true,
        isApproved: true,
        isRejected: true,
        created_at: true,
      },
    });
  }

  async updateMyProfile(user: any, dto: any) {
    if (user.role === 'STUDENT') {
      return this.updateStudent(user.id, dto as UpdateStudentDto);
    }

    if (user.role === 'ORGANIZER') {
      return this.updateOrganizer(user.id, dto as UpdateOrganizerDto);
    }

    if (user.role === 'ADMIN') {
      return this.updateAdmin(user.id, dto as UpdateAdminDto);
    }

    throw new ForbiddenException('Rol necunoscut');
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.users.findUnique({
      where: { id_user: userId },
    });

    if (!user) throw new BadRequestException('Utilizator inexistent');

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password_hash,
    );
    if (!isMatch) {
      throw new BadRequestException('Parola curentă este incorectă');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.users.update({
      where: { id_user: userId },
      data: { password_hash: hashedPassword },
    });

    return { success: true, message: 'Parola a fost schimbată cu succes' };
  }

  async deleteMyAccount(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id_user: userId },
    });

    if (!user) throw new BadRequestException('Utilizator inexistent');
    await this.prisma.$transaction(async (tx) => {
      await tx.registrations.deleteMany({ where: { user_id: userId } });
      await tx.notifications.deleteMany({ where: { user_id: userId } });
      await tx.feedback.deleteMany({ where: { user_id: userId } });
      await tx.favorite_events.deleteMany({ where: { user_id: userId } });
      await tx.reminder_logs.deleteMany({ where: { user_id: userId } });
      await tx.users.delete({ where: { id_user: userId } });
    });

    return { success: true, message: 'Contul a fost șters cu succes' };
  }

  private async updateStudent(userId: number, dto: UpdateStudentDto) {
    return this.prisma.users.update({
      where: { id_user: userId },
      data: {
        first_name: dto.firstName,
        last_name: dto.lastName,
        faculty_id: dto.facultyId,
        specialization_id: dto.specializationId,
        study_cycle: dto.studyCycle,
        study_year: dto.studyYear,
      },
    });
  }

  private async updateOrganizer(userId: number, dto: UpdateOrganizerDto) {
    const updated = await this.prisma.users.update({
      where: { id_user: userId },
      data: {
        first_name: dto.firstName,
        last_name: dto.lastName,
        phone: dto.phone,
        organization_name: dto.organizationName,
        organization_description: dto.organizationDescription,
        // Am eliminat resetarea isApproved/isRejected
      },
    });

    return updated;
  }

  private async updateAdmin(userId: number, dto: UpdateAdminDto) {
    return this.prisma.users.update({
      where: { id_user: userId },
      data: {
        first_name: dto.firstName,
        last_name: dto.lastName,
      },
    });
  }
}
