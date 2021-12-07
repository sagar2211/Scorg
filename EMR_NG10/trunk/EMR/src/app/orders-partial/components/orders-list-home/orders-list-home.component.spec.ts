import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersListHomeComponent } from './orders-list-home.component';

describe('OrdersListHomeComponent', () => {
  let component: OrdersListHomeComponent;
  let fixture: ComponentFixture<OrdersListHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersListHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersListHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
