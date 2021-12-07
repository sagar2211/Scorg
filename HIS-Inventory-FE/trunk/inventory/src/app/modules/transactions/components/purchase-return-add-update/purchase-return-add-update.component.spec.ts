import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReturnAddUpdateComponent } from './purchase-return-add-update.component';

describe('PurchaseReturnAddUpdateComponent', () => {
  let component: PurchaseReturnAddUpdateComponent;
  let fixture: ComponentFixture<PurchaseReturnAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseReturnAddUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseReturnAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
