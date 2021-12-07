import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreTemplateHomeComponent } from './score-template-home.component';

describe('ScoreTemplateHomeComponent', () => {
  let component: ScoreTemplateHomeComponent;
  let fixture: ComponentFixture<ScoreTemplateHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoreTemplateHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreTemplateHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
