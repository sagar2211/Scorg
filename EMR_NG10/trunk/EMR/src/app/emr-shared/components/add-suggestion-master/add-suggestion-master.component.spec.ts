import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSuggestionMasterComponent } from './add-suggestion-master.component';

describe('AddSuggestionMasterComponent', () => {
  let component: AddSuggestionMasterComponent;
  let fixture: ComponentFixture<AddSuggestionMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSuggestionMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSuggestionMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
