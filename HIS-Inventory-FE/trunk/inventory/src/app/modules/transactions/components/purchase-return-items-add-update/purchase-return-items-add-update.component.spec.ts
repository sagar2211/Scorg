import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReturnItemsAddUpdateComponent } from './purchase-return-items-add-update.component';

describe('PurchaseReturnItemsAddUpdateComponent', () => {
  let component: PurchaseReturnItemsAddUpdateComponent;
  let fixture: ComponentFixture<PurchaseReturnItemsAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseReturnItemsAddUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseReturnItemsAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
