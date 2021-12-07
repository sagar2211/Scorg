import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionModelPopupComponent } from './suggestion-model-popup.component';

describe('SuggestionModelPopupComponent', () => {
  let component: SuggestionModelPopupComponent;
  let fixture: ComponentFixture<SuggestionModelPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuggestionModelPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestionModelPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
