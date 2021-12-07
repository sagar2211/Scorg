import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAllergyComponent } from './dashboard-allergy.component';

describe('DashboardAllergyComponent', () => {
  let component: DashboardAllergyComponent;
  let fixture: ComponentFixture<DashboardAllergyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardAllergyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardAllergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
