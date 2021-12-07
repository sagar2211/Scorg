import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPatientSaleComponent } from './add-patient-sale.component';

describe('AddPatientSaleComponent', () => {
  let component: AddPatientSaleComponent;
  let fixture: ComponentFixture<AddPatientSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPatientSaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPatientSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
