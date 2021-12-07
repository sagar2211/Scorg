import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayQueueTemplate4Component } from './display-queue-template4.component';

describe('DisplayQueueTemplate4Component', () => {
  let component: DisplayQueueTemplate4Component;
  let fixture: ComponentFixture<DisplayQueueTemplate4Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayQueueTemplate4Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayQueueTemplate4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
