import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickBookAppointmentComponent } from './quick-book-appointment.component';

describe('QuickBookAppointmentComponent', () => {
  let component: QuickBookAppointmentComponent;
  let fixture: ComponentFixture<QuickBookAppointmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickBookAppointmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickBookAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
