import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationHomeComponent } from './location-home.component';

describe('LocationHomeComponent', () => {
  let component: LocationHomeComponent;
  let fixture: ComponentFixture<LocationHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
