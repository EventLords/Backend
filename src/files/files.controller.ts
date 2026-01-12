import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Delete } from '@nestjs/common';

@Controller('events/:eventId/files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  
  @Post()
  @Roles('ORGANIZER')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req,
    @Param('eventId', ParseIntPipe) eventId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Use multipart/form-data with field "file".',
      );
    }

    return this.filesService.uploadFile(req.user.id, eventId, file.path);
  }

  
  @Get()
  async getEventFiles(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.filesService.getEventFiles(eventId);
  }

  
  @Patch(':fileId/cover')
  @Roles('ORGANIZER')
  async setCover(
    @Req() req,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
  ) {
    return this.filesService.setCoverImage(req.user.id, eventId, fileId);
  }

  
  @Get('cover')
  async getCover(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.filesService.getCoverImage(eventId);
  }
  @Delete('cover')
  @Roles('ORGANIZER')
  async clearCover(
    @Req() req,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.filesService.clearCoverImage(req.user.id, eventId);
  }
  @Delete(':fileId')
  @Roles('ORGANIZER')
  async deleteFile(
    @Req() req,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
  ) {
    return this.filesService.deleteFile(req.user.id, eventId, fileId);
  }
}
