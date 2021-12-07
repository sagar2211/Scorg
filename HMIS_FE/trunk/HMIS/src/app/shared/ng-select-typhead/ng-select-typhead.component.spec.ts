import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgSelectTypheadComponent } from './ng-select-typhead.component';

describe('NgSelectTypheadComponent', () => {
  let component: NgSelectTypheadComponent;
  let fixture: ComponentFixture<NgSelectTypheadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgSelectTypheadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgSelectTypheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
