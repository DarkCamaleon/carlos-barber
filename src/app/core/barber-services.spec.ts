import { TestBed } from '@angular/core/testing';

import { BarberServices } from './barber-services';

describe('BarberServices', () => {
  let service: BarberServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BarberServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
