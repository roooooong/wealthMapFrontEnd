import { TestBed } from '@angular/core/testing';

import { WealthserviceService } from './wealthservice.service';

describe('WealthserviceService', () => {
  let service: WealthserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WealthserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
