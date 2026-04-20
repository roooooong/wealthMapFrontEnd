import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { riskGuard } from './risk.guard';

describe('riskGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => riskGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
