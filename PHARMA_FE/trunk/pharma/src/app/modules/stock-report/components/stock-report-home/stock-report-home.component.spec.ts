import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockReportHomeComponent } from './stock-report-home.component';

describe('StockReportHomeComponent', () => {
  let component: StockReportHomeComponent;
  let fixture: ComponentFixture<StockReportHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockReportHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockReportHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
