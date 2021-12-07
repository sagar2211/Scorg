import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackSendSettingComponent } from './feedback-send-setting.component';

describe('FeedbackSendSettingComponent', () => {
  let component: FeedbackSendSettingComponent;
  let fixture: ComponentFixture<FeedbackSendSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedbackSendSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackSendSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
