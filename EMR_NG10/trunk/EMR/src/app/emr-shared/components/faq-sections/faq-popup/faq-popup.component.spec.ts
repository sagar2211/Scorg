import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqPopupComponent } from './faq-popup.component';

describe('FaqPopupComponent', () => {
  let component: FaqPopupComponent;
  let fixture: ComponentFixture<FaqPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
