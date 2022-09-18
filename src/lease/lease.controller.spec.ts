import { Test, TestingModule } from '@nestjs/testing';
import { LeaseController } from './lease.controller';
import { LeaseService } from './lease.service';

const mockLeaseService = {};

describe('LeaseController', () => {
  let controller: LeaseController;
  let service: LeaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaseController],
      providers: [LeaseService],
    })
      .overrideProvider(LeaseService)
      .useValue(mockLeaseService)
      .compile();

    controller = module.get<LeaseController>(LeaseController);
    service = module.get<LeaseService>(LeaseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
