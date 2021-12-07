import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCommunicationHomeComponent } from './event-communication-home.component';

describe('EventCommunicationHomeComponent', () => {
  let component: EventCommunicationHomeComponent;
  let fixture: ComponentFixture<EventCommunicationHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventCommunicationHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventCommunicationHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
