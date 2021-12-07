import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceAddUpdateComponent } from './purchase-invoice-add-update.component';

describe('PurchaseInvoiceAddUpdateComponent', () => {
  let component: PurchaseInvoiceAddUpdateComponent;
  let fixture: ComponentFixture<PurchaseInvoiceAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseInvoiceAddUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseInvoiceAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
