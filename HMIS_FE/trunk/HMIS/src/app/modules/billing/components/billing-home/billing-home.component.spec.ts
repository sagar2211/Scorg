import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingHomeComponent } from './billing-home.component';

describe('TransactionsHomeComponent', () => {
  let component: BillingHomeComponent;
  let fixture: ComponentFixture<BillingHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
