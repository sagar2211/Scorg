import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientHistoryFilterComponent } from './patient-history-filter.component';

describe('PatientHistoryFilterComponent', () => {
  let component: PatientHistoryFilterComponent;
  let fixture: ComponentFixture<PatientHistoryFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientHistoryFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientHistoryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
