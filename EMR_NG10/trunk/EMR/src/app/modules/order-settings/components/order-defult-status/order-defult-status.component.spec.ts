import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDefultStatusComponent } from './order-defult-status.component';

describe('OrderDefultStatusComponent', () => {
  let component: OrderDefultStatusComponent;
  let fixture: ComponentFixture<OrderDefultStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderDefultStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDefultStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
