import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewScoreTemplateComponent } from './preview-score-template.component';

describe('PreviewScoreTemplateComponent', () => {
  let component: PreviewScoreTemplateComponent;
  let fixture: ComponentFixture<PreviewScoreTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewScoreTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewScoreTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
