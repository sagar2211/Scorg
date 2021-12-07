import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestigationReportHistoryFilterComponent } from './investigation-report-history-filter.component';

describe('InvestigationReportHistoryFilterComponent', () => {
  let component: InvestigationReportHistoryFilterComponent;
  let fixture: ComponentFixture<InvestigationReportHistoryFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestigationReportHistoryFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestigationReportHistoryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
