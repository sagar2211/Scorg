import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDiagnosisComponent } from './dashboard-diagnosis.component';

describe('DashboardDiagnosisComponent', () => {
  let component: DashboardDiagnosisComponent;
  let fixture: ComponentFixture<DashboardDiagnosisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardDiagnosisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDiagnosisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
