import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrderSetOfChartComponent } from './add-order-set-of-chart.component';

describe('AddOrderSetOfChartComponent', () => {
  let component: AddOrderSetOfChartComponent;
  let fixture: ComponentFixture<AddOrderSetOfChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddOrderSetOfChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrderSetOfChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
