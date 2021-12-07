import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionoutpopupComponent } from './sessionoutpopup.component';

describe('SessionoutpopupComponent', () => {
  let component: SessionoutpopupComponent;
  let fixture: ComponentFixture<SessionoutpopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionoutpopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionoutpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
