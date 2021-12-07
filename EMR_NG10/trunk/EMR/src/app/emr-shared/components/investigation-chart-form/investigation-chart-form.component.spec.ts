import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestigationChartFormComponent } from './investigation-chart-form.component';

describe('InvestigationChartFormComponent', () => {
  let component: InvestigationChartFormComponent;
  let fixture: ComponentFixture<InvestigationChartFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestigationChartFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestigationChartFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
