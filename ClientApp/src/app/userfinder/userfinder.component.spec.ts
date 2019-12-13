import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserfinderComponent } from './userfinder.component';

describe('UserfinderComponent', () => {
  let component: UserfinderComponent;
  let fixture: ComponentFixture<UserfinderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserfinderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserfinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
