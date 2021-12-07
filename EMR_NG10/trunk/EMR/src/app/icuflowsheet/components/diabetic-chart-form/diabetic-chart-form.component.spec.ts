import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiabeticChartFormComponent } from './diabetic-chart-form.component';

describe('DiabeticChartFormComponent', () => {
  let component: DiabeticChartFormComponent;
  let fixture: ComponentFixture<DiabeticChartFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiabeticChartFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiabeticChartFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
