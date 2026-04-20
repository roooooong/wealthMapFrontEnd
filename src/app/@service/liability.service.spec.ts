import { TestBed } from '@angular/core/testing';

import { LiabilityService } from './liability.service';

describe('LiabilityService', () => {
  let service: LiabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
