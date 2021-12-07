import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryRightSectionComponent } from './history-right-section.component';

describe('HistoryRightSectionComponent', () => {
  let component: HistoryRightSectionComponent;
  let fixture: ComponentFixture<HistoryRightSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryRightSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryRightSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
