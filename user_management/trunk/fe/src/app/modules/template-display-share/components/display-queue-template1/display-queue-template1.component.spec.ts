import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayQueueTemplate1Component } from './display-queue-template1.component';

describe('DisplayQueueTemplate1Component', () => {
  let component: DisplayQueueTemplate1Component;
  let fixture: ComponentFixture<DisplayQueueTemplate1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayQueueTemplate1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayQueueTemplate1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
