import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReturnListHomeComponent } from './purchase-return-list-home.component';

describe('PurchaseReturnListHomeComponent', () => {
  let component: PurchaseReturnListHomeComponent;
  let fixture: ComponentFixture<PurchaseReturnListHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseReturnListHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseReturnListHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
