import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HumanBodySummeryComponent } from './human-body-summery.component';

describe('HumanBodySummeryComponent', () => {
  let component: HumanBodySummeryComponent;
  let fixture: ComponentFixture<HumanBodySummeryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HumanBodySummeryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HumanBodySummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
