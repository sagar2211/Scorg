import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSideMenuComponent } from './patient-side-menu.component';

describe('PatientSideMenuComponent', () => {
  let component: PatientSideMenuComponent;
  let fixture: ComponentFixture<PatientSideMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientSideMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
