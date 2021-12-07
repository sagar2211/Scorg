import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestigationHistoryComponent } from './investigation-history.component';

describe('InvestigationHistoryComponent', () => {
  let component: InvestigationHistoryComponent;
  let fixture: ComponentFixture<InvestigationHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestigationHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestigationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
