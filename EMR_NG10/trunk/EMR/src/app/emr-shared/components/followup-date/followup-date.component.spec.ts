import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupDateComponent } from './followup-date.component';

describe('FollowupDateComponent', () => {
  let component: FollowupDateComponent;
  let fixture: ComponentFixture<FollowupDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FollowupDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowupDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
