import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSettingsHomeComponent } from './order-settings-home.component';

describe('OrderSettingsHomeComponent', () => {
  let component: OrderSettingsHomeComponent;
  let fixture: ComponentFixture<OrderSettingsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderSettingsHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSettingsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
