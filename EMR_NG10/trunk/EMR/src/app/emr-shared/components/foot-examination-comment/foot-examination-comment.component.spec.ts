import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FootExaminationCommentComponent } from './foot-examination-comment.component';

describe('FootExaminationCommentComponent', () => {
  let component: FootExaminationCommentComponent;
  let fixture: ComponentFixture<FootExaminationCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FootExaminationCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FootExaminationCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
