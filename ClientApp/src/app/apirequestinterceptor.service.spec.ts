import { TestBed } from '@angular/core/testing';

import { ApiRequestInterceptorService } from './apirequestinterceptor.service';

describe('ApirequestinterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
      const service: ApiRequestInterceptorService = TestBed.get(ApiRequestInterceptorService);
    expect(service).toBeTruthy();
  });
});
