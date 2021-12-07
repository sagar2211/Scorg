import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDisplayOnDischargeComponent } from './order-display-on-discharge.component';

describe('OrderDisplayOnDischargeComponent', () => {
  let component: OrderDisplayOnDischargeComponent;
  let fixture: ComponentFixture<OrderDisplayOnDischargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderDisplayOnDischargeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDisplayOnDischargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
