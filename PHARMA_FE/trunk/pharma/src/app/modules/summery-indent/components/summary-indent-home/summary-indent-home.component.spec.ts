import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryIndentHomeComponent } from './summary-indent-home.component';

describe('SummaryIndentHomeComponent', () => {
  let component: SummaryIndentHomeComponent;
  let fixture: ComponentFixture<SummaryIndentHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryIndentHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryIndentHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
