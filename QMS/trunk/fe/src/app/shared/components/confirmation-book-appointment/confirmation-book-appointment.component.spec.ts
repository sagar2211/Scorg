import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationBookAppointmentComponent } from './confirmation-book-appointment.component';

describe('ConfirmationBookAppointmentComponent', () => {
  let component: ConfirmationBookAppointmentComponent;
  let fixture: ComponentFixture<ConfirmationBookAppointmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationBookAppointmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationBookAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
