import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveIcuMonitorComponent } from './live-icu-monitor.component';

describe('LiveIcuMonitorComponent', () => {
  let component: LiveIcuMonitorComponent;
  let fixture: ComponentFixture<LiveIcuMonitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveIcuMonitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveIcuMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
