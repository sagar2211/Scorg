import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayQueueTemplate3Component } from './display-queue-template3.component';

describe('DisplayQueueTemplate3Component', () => {
  let component: DisplayQueueTemplate3Component;
  let fixture: ComponentFixture<DisplayQueueTemplate3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayQueueTemplate3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayQueueTemplate3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
