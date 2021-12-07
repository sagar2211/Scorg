import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersListPartialComponent } from './orders-list-partial.component';

describe('OrdersListPartialComponent', () => {
  let component: OrdersListPartialComponent;
  let fixture: ComponentFixture<OrdersListPartialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersListPartialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersListPartialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
