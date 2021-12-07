import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentStatusDisplayNameComponent } from './appointment-status-display-name.component';

describe('ApplicationSettingsComponent', () => {
  let component: AppointmentStatusDisplayNameComponent;
  let fixture: ComponentFixture<AppointmentStatusDisplayNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentStatusDisplayNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentStatusDisplayNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
