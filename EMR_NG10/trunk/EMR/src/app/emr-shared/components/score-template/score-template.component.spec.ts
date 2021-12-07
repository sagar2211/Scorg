import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreTemplateComponent } from './score-template.component';

describe('ScoreTemplateComponent', () => {
  let component: ScoreTemplateComponent;
  let fixture: ComponentFixture<ScoreTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoreTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
