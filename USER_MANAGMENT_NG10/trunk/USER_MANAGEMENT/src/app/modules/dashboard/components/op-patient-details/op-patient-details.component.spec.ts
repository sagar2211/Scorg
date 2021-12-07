import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpPatientDetailsComponent } from './op-patient-details.component';

describe('OpPatientDetailsComponent', () => {
  let component: OpPatientDetailsComponent;
  let fixture: ComponentFixture<OpPatientDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpPatientDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpPatientDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
