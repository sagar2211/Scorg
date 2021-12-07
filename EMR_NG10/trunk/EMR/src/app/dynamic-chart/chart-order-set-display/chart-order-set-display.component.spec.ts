import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartOrderSetDisplayComponent } from './chart-order-set-display.component';

describe('ChartOrderSetDisplayComponent', () => {
  let component: ChartOrderSetDisplayComponent;
  let fixture: ComponentFixture<ChartOrderSetDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartOrderSetDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartOrderSetDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
