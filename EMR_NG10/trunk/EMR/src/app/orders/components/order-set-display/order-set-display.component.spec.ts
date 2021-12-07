import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSetDisplayComponent } from './order-set-display.component';

describe('OrderSetDisplayComponent', () => {
  let component: OrderSetDisplayComponent;
  let fixture: ComponentFixture<OrderSetDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderSetDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSetDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
