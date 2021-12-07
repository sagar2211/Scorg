import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TempQueueComponent } from './temp-queue.component';

describe('TempQueueComponent', () => {
  let component: TempQueueComponent;
  let fixture: ComponentFixture<TempQueueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TempQueueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TempQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
