import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRecieptUpdateComponent } from './purchase-reciept-update.component';

describe('PurchaseRecieptUpdateComponent', () => {
  let component: PurchaseRecieptUpdateComponent;
  let fixture: ComponentFixture<PurchaseRecieptUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseRecieptUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseRecieptUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
