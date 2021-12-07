import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceScheduleSummaryComponent } from './service-schedule-summary.component';

describe('ServiceScheduleSummaryComponent', () => {
  let component: ServiceScheduleSummaryComponent;
  let fixture: ComponentFixture<ServiceScheduleSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceScheduleSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceScheduleSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
