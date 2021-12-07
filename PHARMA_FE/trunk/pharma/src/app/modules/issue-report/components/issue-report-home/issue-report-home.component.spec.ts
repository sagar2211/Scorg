import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueReportHomeComponent } from './issue-report-home.component';

describe('IssueReportHomeComponent', () => {
  let component: IssueReportHomeComponent;
  let fixture: ComponentFixture<IssueReportHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IssueReportHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueReportHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
