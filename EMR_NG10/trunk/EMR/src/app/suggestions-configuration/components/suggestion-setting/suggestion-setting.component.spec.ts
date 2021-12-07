import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionSettingComponent } from './suggestion-setting.component';

describe('SuggestionSettingComponent', () => {
  let component: SuggestionSettingComponent;
  let fixture: ComponentFixture<SuggestionSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuggestionSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestionSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
