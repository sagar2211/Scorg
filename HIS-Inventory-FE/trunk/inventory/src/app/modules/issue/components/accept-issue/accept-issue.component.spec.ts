import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptIssueComponent } from './accept-issue.component';

describe('AcceptIssueComponent', () => {
  let component: AcceptIssueComponent;
  let fixture: ComponentFixture<AcceptIssueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptIssueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
