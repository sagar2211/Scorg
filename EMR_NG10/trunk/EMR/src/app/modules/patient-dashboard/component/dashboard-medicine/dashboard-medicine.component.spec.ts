import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMedicineComponent } from './dashboard-medicine.component';

describe('DashboardMedicineComponent', () => {
  let component: DashboardMedicineComponent;
  let fixture: ComponentFixture<DashboardMedicineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardMedicineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
