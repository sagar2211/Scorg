import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GdnReportHomeComponent } from './gdn-report-home.component';

describe('GdnReportHomeComponent', () => {
  let component: GdnReportHomeComponent;
  let fixture: ComponentFixture<GdnReportHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GdnReportHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GdnReportHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
