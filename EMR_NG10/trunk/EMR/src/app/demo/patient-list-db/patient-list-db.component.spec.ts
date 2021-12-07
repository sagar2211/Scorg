import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientListDBComponent } from './patient-list-db.component';

describe('PatientListDBComponent', () => {
  let component: PatientListDBComponent;
  let fixture: ComponentFixture<PatientListDBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientListDBComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientListDBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
