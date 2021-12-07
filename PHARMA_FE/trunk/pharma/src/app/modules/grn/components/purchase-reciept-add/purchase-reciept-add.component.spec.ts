import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRecieptAddComponent } from './purchase-reciept-add.component';

describe('PurchaseRecieptAddComponent', () => {
  let component: PurchaseRecieptAddComponent;
  let fixture: ComponentFixture<PurchaseRecieptAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseRecieptAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseRecieptAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
