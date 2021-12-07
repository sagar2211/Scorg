import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DibeticChartRowDataComponent } from './dibetic-chart-row-data.component';

describe('DibeticChartRowDataComponent', () => {
  let component: DibeticChartRowDataComponent;
  let fixture: ComponentFixture<DibeticChartRowDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DibeticChartRowDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DibeticChartRowDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
