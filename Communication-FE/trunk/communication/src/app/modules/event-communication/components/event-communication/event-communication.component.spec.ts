import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCommunicationComponent } from './event-communication.component';

describe('EventCommunicationComponent', () => {
  let component: EventCommunicationComponent;
  let fixture: ComponentFixture<EventCommunicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventCommunicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventCommunicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
