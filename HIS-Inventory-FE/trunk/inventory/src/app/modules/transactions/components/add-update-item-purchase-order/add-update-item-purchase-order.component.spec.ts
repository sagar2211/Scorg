import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateItemPurchaseOrderComponent } from './add-update-item-purchase-order.component';

describe('AddUpdateItemPurchaseOrderComponent', () => {
  let component: AddUpdateItemPurchaseOrderComponent;
  let fixture: ComponentFixture<AddUpdateItemPurchaseOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateItemPurchaseOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateItemPurchaseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
