import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryHomeComponent } from './history-home.component';

describe('HistoryHomeComponent', () => {
  let component: HistoryHomeComponent;
  let fixture: ComponentFixture<HistoryHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
