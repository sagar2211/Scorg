import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestigationReportSortViewComponent } from './investigation-report-sort-view.component';

describe('InvestigationReportSortViewComponent', () => {
  let component: InvestigationReportSortViewComponent;
  let fixture: ComponentFixture<InvestigationReportSortViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestigationReportSortViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestigationReportSortViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
