import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingStationSelectionComponent } from './nursing-station-selection.component';

describe('NursingStationSelectionComponent', () => {
  let component: NursingStationSelectionComponent;
  let fixture: ComponentFixture<NursingStationSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingStationSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NursingStationSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
