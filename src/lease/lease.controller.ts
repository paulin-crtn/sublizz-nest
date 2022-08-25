import { Controller, Get } from '@nestjs/common';
import { LeaseService } from './lease.service';

@Controller('lease')
export class LeaseController {
  constructor(private leaseService: LeaseService) {}
  @Get()
  findAll() {
    return this.leaseService.findAll();
  }
}
