import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgSelectTypeaheadComponent } from './ng-select-typeahead.component';

describe('NgSelectTypeaheadComponent', () => {
  let component: NgSelectTypeaheadComponent;
  let fixture: ComponentFixture<NgSelectTypeaheadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgSelectTypeaheadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgSelectTypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
