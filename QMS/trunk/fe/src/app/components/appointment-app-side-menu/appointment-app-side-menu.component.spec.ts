import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentAppSideMenuComponent } from './appointment-app-side-menu.component';

describe('AppointmentAppSideMenuComponent', () => {
  let component: AppointmentAppSideMenuComponent;
  let fixture: ComponentFixture<AppointmentAppSideMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentAppSideMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentAppSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
