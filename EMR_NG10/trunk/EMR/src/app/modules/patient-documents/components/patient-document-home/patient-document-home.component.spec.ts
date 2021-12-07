import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDocumentHomeComponent } from './patient-document-home.component';

describe('PatientDocumentHomeComponent', () => {
  let component: PatientDocumentHomeComponent;
  let fixture: ComponentFixture<PatientDocumentHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientDocumentHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDocumentHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
