import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyPrescriptionChartListComponent } from './copy-prescription-chart-list.component';

describe('CopyPrescriptionChartListComponent', () => {
  let component: CopyPrescriptionChartListComponent;
  let fixture: ComponentFixture<CopyPrescriptionChartListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyPrescriptionChartListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyPrescriptionChartListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
