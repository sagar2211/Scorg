import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientHomeComponentComponent } from './patient-home-component.component';

describe('PatientHomeComponentComponent', () => {
  let component: PatientHomeComponentComponent;
  let fixture: ComponentFixture<PatientHomeComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientHomeComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientHomeComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
