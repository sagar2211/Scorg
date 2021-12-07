import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarChartHomeComponent } from './mar-chart-home.component';

describe('MarChartHomeComponent', () => {
  let component: MarChartHomeComponent;
  let fixture: ComponentFixture<MarChartHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarChartHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarChartHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
