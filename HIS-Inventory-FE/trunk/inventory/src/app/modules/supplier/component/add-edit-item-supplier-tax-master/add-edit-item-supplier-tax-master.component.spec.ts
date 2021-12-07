import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditItemSupplierTaxMasterComponent } from './add-edit-item-supplier-tax-master.component';

describe('AddEditItemSupplierTaxMasterComponent', () => {
  let component: AddEditItemSupplierTaxMasterComponent;
  let fixture: ComponentFixture<AddEditItemSupplierTaxMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditItemSupplierTaxMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditItemSupplierTaxMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
