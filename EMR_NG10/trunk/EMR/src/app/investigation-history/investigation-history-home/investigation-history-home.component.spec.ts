import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestigationHistoryHomeComponent } from './investigation-history-home.component';

describe('InvestigationHistoryHomeComponent', () => {
  let component: InvestigationHistoryHomeComponent;
  let fixture: ComponentFixture<InvestigationHistoryHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestigationHistoryHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestigationHistoryHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
