import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSetListComponent } from './order-set-list.component';

describe('OrderSetListComponent', () => {
  let component: OrderSetListComponent;
  let fixture: ComponentFixture<OrderSetListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderSetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
