import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueAcceptanceListComponent } from './issue-acceptance-list.component';

describe('IssueAcceptanceListComponent', () => {
  let component: IssueAcceptanceListComponent;
  let fixture: ComponentFixture<IssueAcceptanceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IssueAcceptanceListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueAcceptanceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
