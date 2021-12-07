import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentPrioritySettingComponent } from './appointment-priority-setting.component';

describe('AppointmentPrioritySettingComponent', () => {
  let component: AppointmentPrioritySettingComponent;
  let fixture: ComponentFixture<AppointmentPrioritySettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentPrioritySettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentPrioritySettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
