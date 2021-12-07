import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientTransferComponent } from './patient-transfer.component';

describe('PatientTransferComponent', () => {
  let component: PatientTransferComponent;
  let fixture: ComponentFixture<PatientTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
