import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVoucherItemListComponent } from './patient-voucher-item-list.component';

describe('PatientVoucherItemListComponent', () => {
  let component: PatientVoucherItemListComponent;
  let fixture: ComponentFixture<PatientVoucherItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientVoucherItemListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientVoucherItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
