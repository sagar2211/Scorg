import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HisServiceOrderComponent } from './his-service-order.component';

describe('HisServiceOrderComponent', () => {
  let component: HisServiceOrderComponent;
  let fixture: ComponentFixture<HisServiceOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HisServiceOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HisServiceOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
