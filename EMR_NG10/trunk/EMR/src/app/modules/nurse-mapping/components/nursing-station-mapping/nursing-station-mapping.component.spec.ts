import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingStationMappingComponent } from './nursing-station-mapping.component';

describe('NursingStationMappingComponent', () => {
  let component: NursingStationMappingComponent;
  let fixture: ComponentFixture<NursingStationMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingStationMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NursingStationMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
