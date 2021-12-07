import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRecieptAddUpdateComponent } from './purchase-reciept-add-update.component';

describe('PurchaseRecieptAddUpdateComponent', () => {
  let component: PurchaseRecieptAddUpdateComponent;
  let fixture: ComponentFixture<PurchaseRecieptAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseRecieptAddUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseRecieptAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
