import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreTemplateListComponent } from './score-template-list.component';

describe('ScoreTemplateListComponent', () => {
  let component: ScoreTemplateListComponent;
  let fixture: ComponentFixture<ScoreTemplateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoreTemplateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreTemplateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
