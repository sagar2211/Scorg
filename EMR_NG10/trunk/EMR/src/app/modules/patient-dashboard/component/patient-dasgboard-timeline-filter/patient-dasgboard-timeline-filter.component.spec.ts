import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDasgboardTimelineFilterComponent } from './patient-dasgboard-timeline-filter.component';

describe('PatientDasgboardTimelineFilterComponent', () => {
  let component: PatientDasgboardTimelineFilterComponent;
  let fixture: ComponentFixture<PatientDasgboardTimelineFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientDasgboardTimelineFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDasgboardTimelineFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
