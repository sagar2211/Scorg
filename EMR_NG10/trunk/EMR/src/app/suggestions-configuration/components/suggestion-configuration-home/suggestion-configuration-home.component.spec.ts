import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionConfigurationHomeComponent } from './suggestion-configuration-home.component';

describe('SuggestionConfigurationHomeComponent', () => {
  let component: SuggestionConfigurationHomeComponent;
  let fixture: ComponentFixture<SuggestionConfigurationHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuggestionConfigurationHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestionConfigurationHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
