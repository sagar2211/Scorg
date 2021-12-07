import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayQueueTemplate7Component } from './display-queue-template7.component';

describe('DisplayQueueTemplate7Component', () => {
  let component: DisplayQueueTemplate7Component;
  let fixture: ComponentFixture<DisplayQueueTemplate7Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayQueueTemplate7Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayQueueTemplate7Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
