import { Test, TestingModule } from '@nestjs/testing';
import { LeaseService } from './lease.service';

describe('LeaseService', () => {
  let service: LeaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaseService],
    }).compile();

    service = module.get<LeaseService>(LeaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
