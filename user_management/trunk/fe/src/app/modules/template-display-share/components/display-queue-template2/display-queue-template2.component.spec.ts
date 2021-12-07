import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayQueueTemplate2Component } from './display-queue-template2.component';

describe('DisplayQueueTemplate2Component', () => {
  let component: DisplayQueueTemplate2Component;
  let fixture: ComponentFixture<DisplayQueueTemplate2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayQueueTemplate2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayQueueTemplate2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
