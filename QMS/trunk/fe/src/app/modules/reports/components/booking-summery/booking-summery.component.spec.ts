import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingSummeryComponent } from './booking-summery.component';

describe('BookingSummeryComponent', () => {
  let component: BookingSummeryComponent;
  let fixture: ComponentFixture<BookingSummeryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookingSummeryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingSummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
