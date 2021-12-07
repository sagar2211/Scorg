import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientViewOnlyRedirectComponent } from './patient-view-only-redirect.component';

describe('PatientViewOnlyRedirectComponent', () => {
  let component: PatientViewOnlyRedirectComponent;
  let fixture: ComponentFixture<PatientViewOnlyRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientViewOnlyRedirectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientViewOnlyRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
