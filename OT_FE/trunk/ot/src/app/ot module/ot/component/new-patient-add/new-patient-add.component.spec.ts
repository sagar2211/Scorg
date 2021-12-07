import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPatientAddComponent } from './new-patient-add.component';

describe('NewPatientAddComponent', () => {
  let component: NewPatientAddComponent;
  let fixture: ComponentFixture<NewPatientAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPatientAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPatientAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
