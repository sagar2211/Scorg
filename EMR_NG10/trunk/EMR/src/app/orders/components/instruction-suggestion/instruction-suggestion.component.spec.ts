import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionSuggestionComponent } from './instruction-suggestion.component';

describe('InstructionSuggestionComponent', () => {
  let component: InstructionSuggestionComponent;
  let fixture: ComponentFixture<InstructionSuggestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstructionSuggestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructionSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
