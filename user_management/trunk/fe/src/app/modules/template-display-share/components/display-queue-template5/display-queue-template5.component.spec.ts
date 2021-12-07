import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayQueueTemplate5Component } from './display-queue-template5.component';

describe('DisplayQueueTemplate5Component', () => {
  let component: DisplayQueueTemplate5Component;
  let fixture: ComponentFixture<DisplayQueueTemplate5Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayQueueTemplate5Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayQueueTemplate5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
