import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueDisplayListComponent } from './queue-display-list.component';

describe('QueueDisplayListComponent', () => {
  let component: QueueDisplayListComponent;
  let fixture: ComponentFixture<QueueDisplayListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueueDisplayListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueueDisplayListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
