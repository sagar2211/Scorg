import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPacsHomeComponent } from './patient-pacs-home.component';

describe('PatientPacsHomeComponent', () => {
  let component: PatientPacsHomeComponent;
  let fixture: ComponentFixture<PatientPacsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPacsHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPacsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
