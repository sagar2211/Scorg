import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseGrnDetailsComponent } from './purchase-grn-details.component';

describe('PurchaseGrnDetailsComponent', () => {
  let component: PurchaseGrnDetailsComponent;
  let fixture: ComponentFixture<PurchaseGrnDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseGrnDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseGrnDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
