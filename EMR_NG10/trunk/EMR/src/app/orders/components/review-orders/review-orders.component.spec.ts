import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewOrdersComponent } from './review-orders.component';

describe('ReviewOrdersComponent', () => {
  let component: ReviewOrdersComponent;
  let fixture: ComponentFixture<ReviewOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
