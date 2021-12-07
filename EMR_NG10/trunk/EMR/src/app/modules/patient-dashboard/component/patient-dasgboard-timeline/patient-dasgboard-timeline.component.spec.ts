import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDasgboardTimelineComponent } from './patient-dasgboard-timeline.component';

describe('PatientDasgboardTimelineComponent', () => {
  let component: PatientDasgboardTimelineComponent;
  let fixture: ComponentFixture<PatientDasgboardTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientDasgboardTimelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDasgboardTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
