import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderPatienthistoryComponent } from './slider-patienthistory.component';

describe('SliderPatienthistoryComponent', () => {
  let component: SliderPatienthistoryComponent;
  let fixture: ComponentFixture<SliderPatienthistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderPatienthistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderPatienthistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
