import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Query } from '@nestjs/common';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('ORGANIZER')
  createEvent(@Req() req, @Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(
      req.user.id,
      req.user.isApproved,
      dto,
    );
  }

  @Get('organizer')
  @Roles('ORGANIZER')
  getMyEvents(@Req() req) {
    return this.eventsService.getMyEvents(req.user.id);
  }

  @Patch(':id')
  @Roles('ORGANIZER')
  updateEvent(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(id, req.user.id, dto);
  }

  @Patch(':id/submit')
  @Roles('ORGANIZER')
  submitEvent(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.submitEvent(id, req.user.id, req.user.isApproved);
  }

  @Patch(':id/archive')
  @Roles('ORGANIZER')
  archiveEvent(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.archiveEvent(id, req.user.id);
  }

  @Delete(':id')
  @Roles('ORGANIZER')
  deleteEvent(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.deleteEvent(id, req.user.id);
  }

  // STUDENT / PUBLIC
  @Get()
  listActiveEvents(
    @Query('facultyId') facultyId?: string,
    @Query('typeId') typeId?: string,
    @Query('organizerId') organizerId?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.eventsService.listActiveEvents({
      facultyId,
      typeId,
      organizerId,
      search,
      dateFrom,
      dateTo,
    });
  }

  @Get('organizer/archived')
  @Roles('ORGANIZER')
  getMyArchivedEvents(@Req() req) {
    return this.eventsService.getMyArchivedEvents(req.user.id);
  }
  @Get(':id')
  getEventById(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEventById(id);
  }

  // ORGANIZER - DETALII COMPLETE
  @Get(':id/organizer')
  @Roles('ORGANIZER')
  getEventByIdOrganizer(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEventByIdOrganizer(id, req.user.id);
  }
  @Post(':id/favorite')
  @Roles('STUDENT')
  toggleFavorite(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.toggleFavorite(req.user.id, id);
  }
}
