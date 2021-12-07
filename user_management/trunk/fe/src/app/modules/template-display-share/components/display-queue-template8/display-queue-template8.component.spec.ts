import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayQueueTemplate8Component } from './display-queue-template8.component';

describe('DisplayQueueTemplate8Component', () => {
  let component: DisplayQueueTemplate8Component;
  let fixture: ComponentFixture<DisplayQueueTemplate8Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayQueueTemplate8Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayQueueTemplate8Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
