import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsListHomeComponent } from './appointments-list-home.component';

describe('AppointmentsListHomeComponent', () => {
  let component: AppointmentsListHomeComponent;
  let fixture: ComponentFixture<AppointmentsListHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentsListHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentsListHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
