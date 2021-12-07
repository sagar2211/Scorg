import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeSummaryFilterComponent } from './discharge-summary-filter.component';

describe('DischargeSummaryFilterComponent', () => {
  let component: DischargeSummaryFilterComponent;
  let fixture: ComponentFixture<DischargeSummaryFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DischargeSummaryFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeSummaryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
