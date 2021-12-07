import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserToDoctorComponent } from './user-to-doctor.component';

describe('UserToDoctorComponent', () => {
  let component: UserToDoctorComponent;
  let fixture: ComponentFixture<UserToDoctorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserToDoctorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserToDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
