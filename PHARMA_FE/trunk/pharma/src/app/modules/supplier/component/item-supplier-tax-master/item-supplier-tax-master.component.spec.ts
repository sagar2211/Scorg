import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSupplierTaxMasterComponent } from './item-supplier-tax-master.component';

describe('ItemSupplierTaxMasterComponent', () => {
  let component: ItemSupplierTaxMasterComponent;
  let fixture: ComponentFixture<ItemSupplierTaxMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemSupplierTaxMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSupplierTaxMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
