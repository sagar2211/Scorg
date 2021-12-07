import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueSummeryListComponent } from './issue-summery-list.component';

describe('IssueSummeryListComponent', () => {
  let component: IssueSummeryListComponent;
  let fixture: ComponentFixture<IssueSummeryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IssueSummeryListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueSummeryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
