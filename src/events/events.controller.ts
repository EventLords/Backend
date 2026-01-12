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
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  createEvent(@Req() req, @Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(
      req.user.id,
      req.user.isApproved,
      dto,
    );
  }

  @Get('organizer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  getMyEvents(@Req() req) {
    return this.eventsService.getMyEvents(req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  updateEvent(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(id, req.user.id, dto);
  }

  @Patch(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  submitEvent(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.submitEvent(id, req.user.id, req.user.isApproved);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  archiveEvent(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.archiveEvent(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  deleteEvent(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.deleteEvent(id, req.user.id);
  }

  @Get()
  listActiveEvents(
    @Query('facultyId') facultyId?: string,
    @Query('typeId') typeId?: string,
    @Query('organizerId') organizerId?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('location') location?: string,
  ) {
    return this.eventsService.listActiveEvents({
      facultyId,
      typeId,
      organizerId,
      search,
      dateFrom,
      dateTo,
      location,
    });
  }

  @Get('organizer/archived')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  getMyArchivedEvents(@Req() req) {
    return this.eventsService.getMyArchivedEvents(req.user.id);
  }

  @Get(':id')
  getEventById(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEventById(id);
  }

  @Get(':id/organizer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  getEventByIdOrganizer(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEventByIdOrganizer(id, req.user.id);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  toggleFavorite(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.toggleFavorite(req.user.id, id);
  }

  @Get('organizer/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  getOrganizerDashboard(@Req() req) {
    return this.eventsService.getOrganizerDashboard(req.user.id);
  }

  @Get('favorites/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  getMyFavorites(@Req() req) {
    return this.eventsService.getMyFavoriteEvents(req.user.id);
  }

  @Get('admin-details/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getEventForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEventDetailsForAdmin(id);
  }
}
