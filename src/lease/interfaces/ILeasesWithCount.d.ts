import { ICityCoordinates } from './ICityCoordinates';

export interface ILeasesWithCount {
  totalCount: number;
  leases: (Lease & {
    leaseImages: LeaseImage[];
  })[];
  cityCoordinates?: ICityCoordinates;
}
