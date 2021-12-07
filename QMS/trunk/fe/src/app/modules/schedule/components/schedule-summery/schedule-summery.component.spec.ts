import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleSummeryComponent } from './schedule-summery.component';

describe('ScheduleSummeryComponent', () => {
  let component: ScheduleSummeryComponent;
  let fixture: ComponentFixture<ScheduleSummeryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleSummeryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleSummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
