import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeptStoreIssueComponent } from './dept-store-issue.component';

describe('DeptStoreIssueComponent', () => {
  let component: DeptStoreIssueComponent;
  let fixture: ComponentFixture<DeptStoreIssueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeptStoreIssueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeptStoreIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
