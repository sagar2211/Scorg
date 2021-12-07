import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FduserAppointmentlistComponent } from './fduser-appointmentlist.component';

describe('FduserAppointmentlistComponent', () => {
  let component: FduserAppointmentlistComponent;
  let fixture: ComponentFixture<FduserAppointmentlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FduserAppointmentlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FduserAppointmentlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
