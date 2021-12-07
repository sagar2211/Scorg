import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqFormsComponent } from './faq-forms.component';

describe('FaqFormsComponent', () => {
  let component: FaqFormsComponent;
  let fixture: ComponentFixture<FaqFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
