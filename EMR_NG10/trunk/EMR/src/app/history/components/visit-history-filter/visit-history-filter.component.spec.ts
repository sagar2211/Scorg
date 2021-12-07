import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitHistoryFilterComponent } from './visit-history-filter.component';

describe('VisitHistoryFilterComponent', () => {
  let component: VisitHistoryFilterComponent;
  let fixture: ComponentFixture<VisitHistoryFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisitHistoryFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitHistoryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
