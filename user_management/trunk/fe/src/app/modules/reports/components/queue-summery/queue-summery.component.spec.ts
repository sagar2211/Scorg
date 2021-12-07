import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueSummeryComponent } from './queue-summery.component';

describe('QueueSummeryComponent', () => {
  let component: QueueSummeryComponent;
  let fixture: ComponentFixture<QueueSummeryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueueSummeryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueueSummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
