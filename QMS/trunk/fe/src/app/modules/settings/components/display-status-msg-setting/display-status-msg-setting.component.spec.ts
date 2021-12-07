import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayStatusMsgSettingComponent } from './display-status-msg-setting.component';

describe('DisplayStatusMsgSettingComponent', () => {
  let component: DisplayStatusMsgSettingComponent;
  let fixture: ComponentFixture<DisplayStatusMsgSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayStatusMsgSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayStatusMsgSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
