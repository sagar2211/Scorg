import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayQueueTemplate9Component } from './display-queue-template9.component';

describe('DisplayQueueTemplate9Component', () => {
  let component: DisplayQueueTemplate9Component;
  let fixture: ComponentFixture<DisplayQueueTemplate9Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayQueueTemplate9Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayQueueTemplate9Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
