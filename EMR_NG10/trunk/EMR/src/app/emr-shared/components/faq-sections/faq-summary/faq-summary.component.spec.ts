import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqSummaryComponent } from './faq-summary.component';

describe('FaqSummaryComponent', () => {
  let component: FaqSummaryComponent;
  let fixture: ComponentFixture<FaqSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
