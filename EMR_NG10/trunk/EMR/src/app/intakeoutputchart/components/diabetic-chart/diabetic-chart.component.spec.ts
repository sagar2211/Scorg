import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiabeticChartComponent } from './diabetic-chart.component';

describe('DiabeticChartComponent', () => {
  let component: DiabeticChartComponent;
  let fixture: ComponentFixture<DiabeticChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiabeticChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiabeticChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
