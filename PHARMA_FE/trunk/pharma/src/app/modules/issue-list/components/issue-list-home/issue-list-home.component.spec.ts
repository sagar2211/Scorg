import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueListHomeComponent } from './issue-list-home.component';

describe('IssueListHomeComponent', () => {
  let component: IssueListHomeComponent;
  let fixture: ComponentFixture<IssueListHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IssueListHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueListHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
