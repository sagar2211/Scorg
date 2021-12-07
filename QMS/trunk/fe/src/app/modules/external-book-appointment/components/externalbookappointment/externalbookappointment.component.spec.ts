import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalbookappointmentComponent } from './externalbookappointment.component';

describe('ExternalbookappointmentComponent', () => {
  let component: ExternalbookappointmentComponent;
  let fixture: ComponentFixture<ExternalbookappointmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalbookappointmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalbookappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
