/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { Test, TestingModule } from '@nestjs/testing';
import { Lease, LeaseImage } from '@prisma/client';
import { LeaseController } from './lease.controller';
import { LeaseService } from './lease.service';
import { LeaseDto } from './dto';

/* -------------------------------------------------------------------------- */
/*                                MOCK SERVICES                               */
/* -------------------------------------------------------------------------- */
const mockLeaseService = {
  store: jest.fn((userId: number, dto: LeaseDto) => {
    return {
      id: Date.now(),
      userId,
      ...dto,
      gpsLatitude: '-45.989',
      gpsLongitude: '2.234',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }),
};

/* -------------------------------------------------------------------------- */
/*                                    TESTS                                   */
/* -------------------------------------------------------------------------- */
describe('LeaseController', () => {
  /* ----------------------------- INITIALIZATION ----------------------------- */
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

  /* ---------------------------------- TESTS --------------------------------- */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should store a lease', async () => {
    const result = await controller.store(1, {
      houseNumber: '3',
      street: 'rue Rieux',
      postCode: '92100',
      city: 'Boulogne-Billancourt',
      description: 'Lorem ipsum',
      surface: 43,
      room: 2,
      startDate: new Date(Date.now()),
      endDate: new Date(Date.now()),
      isDateFlexible: 1,
      pricePerMonth: 1400,
      leaseImages: [],
    });

    const expectedObject: Lease & {
      leaseImages: LeaseImage[];
    } = {
      id: expect.any(Number),
      userId: 1,
      houseNumber: '3',
      street: 'rue Rieux',
      postCode: '92100',
      city: 'Boulogne-Billancourt',
      gpsLatitude: '-45.989',
      gpsLongitude: '2.234',
      description: 'Lorem ipsum',
      surface: 43,
      room: 2,
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      isDateFlexible: 1,
      pricePerMonth: 1400,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      leaseImages: [],
    };

    expect(result).toEqual(expectedObject);
  });
});
