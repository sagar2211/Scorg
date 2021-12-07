import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentSlotsSettingsComponent } from './appointment-slots-settings.component';

describe('AppointmentSlotsSettingsComponent', () => {
  let component: AppointmentSlotsSettingsComponent;
  let fixture: ComponentFixture<AppointmentSlotsSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentSlotsSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentSlotsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
