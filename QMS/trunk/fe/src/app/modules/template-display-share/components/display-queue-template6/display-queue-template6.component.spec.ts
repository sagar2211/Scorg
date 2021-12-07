import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayQueueTemplate6Component } from './display-queue-template6.component';

describe('DisplayQueueTemplate6Component', () => {
  let component: DisplayQueueTemplate6Component;
  let fixture: ComponentFixture<DisplayQueueTemplate6Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayQueueTemplate6Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayQueueTemplate6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
