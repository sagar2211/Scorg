import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeFormatSettingComponent } from './time-format-setting.component';

describe('TimeFormatSettingComponent', () => {
  let component: TimeFormatSettingComponent;
  let fixture: ComponentFixture<TimeFormatSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeFormatSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeFormatSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
