import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientBedTransferComponent } from './patient-bed-transfer.component';

describe('PatientBedTransferComponent', () => {
  let component: PatientBedTransferComponent;
  let fixture: ComponentFixture<PatientBedTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientBedTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientBedTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
