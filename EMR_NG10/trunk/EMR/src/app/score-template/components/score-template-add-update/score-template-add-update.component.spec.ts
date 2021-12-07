import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreTemplateAddUpdateComponent } from './score-template-add-update.component';

describe('ScoreTemplateAddUpdateComponent', () => {
  let component: ScoreTemplateAddUpdateComponent;
  let fixture: ComponentFixture<ScoreTemplateAddUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoreTemplateAddUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreTemplateAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
