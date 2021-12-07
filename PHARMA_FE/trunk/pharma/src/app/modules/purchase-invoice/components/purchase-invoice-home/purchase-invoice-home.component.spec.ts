import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceHomeComponent } from './purchase-invoice-home.component';

describe('PurchaseInvoiceHomeComponent', () => {
  let component: PurchaseInvoiceHomeComponent;
  let fixture: ComponentFixture<PurchaseInvoiceHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseInvoiceHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseInvoiceHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
