import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSortInfoComponent } from './patient-sort-info.component';

describe('PatientSortInfoComponent', () => {
  let component: PatientSortInfoComponent;
  let fixture: ComponentFixture<PatientSortInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientSortInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientSortInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
