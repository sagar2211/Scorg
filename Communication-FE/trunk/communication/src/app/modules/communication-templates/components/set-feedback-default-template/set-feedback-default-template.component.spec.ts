import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetFeedbackDefaultTemplateComponent } from './set-feedback-default-template.component';

describe('SetFeedbackDefaultTemplateComponent', () => {
  let component: SetFeedbackDefaultTemplateComponent;
  let fixture: ComponentFixture<SetFeedbackDefaultTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetFeedbackDefaultTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetFeedbackDefaultTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
