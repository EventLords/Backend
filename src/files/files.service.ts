import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadFile(organizerId: number, eventId: number, filePath: string) {
    const event = await this.prisma.events.findFirst({
      where: {
        id_event: eventId,
        organizer_id: organizerId,
      },
    });

    if (!event) {
      throw new ForbiddenException('Nu ai acces la acest eveniment');
    }

    return this.prisma.files.create({
      data: {
        event_id: eventId,
        file_path: filePath,
      },
    });
  }

  async getEventFiles(eventId: number) {
    return this.prisma.files.findMany({
      where: {
        event_id: eventId,
      },
      orderBy: {
        uploaded_at: 'desc',
      },
    });
  }
  async setCoverImage(organizerId: number, eventId: number, fileId: number) {
    // 1️⃣ verificăm dacă evenimentul e al organizatorului
    const event = await this.prisma.events.findFirst({
      where: {
        id_event: eventId,
        organizer_id: organizerId,
      },
    });

    if (!event) {
      throw new ForbiddenException('Nu ai acces la acest eveniment');
    }

    // 2️⃣ verificăm dacă fișierul aparține evenimentului
    const file = await this.prisma.files.findFirst({
      where: {
        id_file: fileId,
        event_id: eventId,
      },
    });

    if (!file) {
      throw new ForbiddenException('Fișier invalid');
    }

    // 3️⃣ resetăm toate cover-urile
    await this.prisma.files.updateMany({
      where: {
        event_id: eventId,
      },
      data: {
        is_cover: false,
      },
    });

    // 4️⃣ setăm fișierul ales ca cover
    return this.prisma.files.update({
      where: {
        id_file: fileId,
      },
      data: {
        is_cover: true,
      },
    });
  }
  async getCoverImage(eventId: number) {
    return this.prisma.files.findFirst({
      where: {
        event_id: eventId,
        is_cover: true,
      },
    });
  }
  async clearCoverImage(organizerId: number, eventId: number) {
    const event = await this.prisma.events.findFirst({
      where: { id_event: eventId, organizer_id: organizerId },
    });

    if (!event) {
      throw new ForbiddenException('Nu ai acces la acest eveniment');
    }

    await this.prisma.files.updateMany({
      where: { event_id: eventId, is_cover: true },
      data: { is_cover: false },
    });

    return { ok: true };
  }
  async deleteFile(organizerId: number, eventId: number, fileId: number) {
    const event = await this.prisma.events.findFirst({
      where: { id_event: eventId, organizer_id: organizerId },
    });

    if (!event) {
      throw new ForbiddenException('Nu ai acces la acest eveniment');
    }

    const file = await this.prisma.files.findFirst({
      where: { id_file: fileId, event_id: eventId },
    });

    if (!file) {
      throw new NotFoundException('Fișierul nu există');
    }

    // 1) ștergem din DB
    await this.prisma.files.delete({
      where: { id_file: fileId },
    });

    // 2) ștergem de pe disk (best-effort: dacă lipsește, nu vrem să crape)
    try {
      await fs.unlink(file.file_path);
    } catch {
      // ignore
    }

    return { ok: true };
  }
}
