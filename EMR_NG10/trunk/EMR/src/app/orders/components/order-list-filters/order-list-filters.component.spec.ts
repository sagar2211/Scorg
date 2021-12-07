import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListFiltersComponent } from './order-list-filters.component';

describe('OrderListFiltersComponent', () => {
  let component: OrderListFiltersComponent;
  let fixture: ComponentFixture<OrderListFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderListFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderListFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
