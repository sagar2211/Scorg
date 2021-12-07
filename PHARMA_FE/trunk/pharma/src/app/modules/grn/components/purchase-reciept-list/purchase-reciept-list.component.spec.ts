import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRecieptListComponent } from './purchase-reciept-list.component';

describe('PurchaseRecieptListComponent', () => {
  let component: PurchaseRecieptListComponent;
  let fixture: ComponentFixture<PurchaseRecieptListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseRecieptListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseRecieptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
