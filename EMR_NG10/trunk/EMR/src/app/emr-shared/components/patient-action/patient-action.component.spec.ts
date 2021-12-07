import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientActionComponent } from './patient-action.component';

describe('PatientActionComponent', () => {
  let component: PatientActionComponent;
  let fixture: ComponentFixture<PatientActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
