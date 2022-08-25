import { Controller, Get } from '@nestjs/common';
import { LeaseService } from './lease.service';

@Controller('leases')
export class LeaseController {
  constructor(private leaseService: LeaseService) {}
  @Get()
  findAll() {
    return this.leaseService.findAll();
  }
}
