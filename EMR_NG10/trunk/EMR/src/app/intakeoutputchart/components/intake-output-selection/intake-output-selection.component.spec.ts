import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntakeOutputSelectionComponent } from './intake-output-selection.component';

describe('IntakeOutputSelectionComponent', () => {
  let component: IntakeOutputSelectionComponent;
  let fixture: ComponentFixture<IntakeOutputSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntakeOutputSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntakeOutputSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
