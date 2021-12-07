import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentAppHomeComponent } from './appointment-app-home.component';

describe('AppointmentAppHomeComponent', () => {
  let component: AppointmentAppHomeComponent;
  let fixture: ComponentFixture<AppointmentAppHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentAppHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentAppHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
