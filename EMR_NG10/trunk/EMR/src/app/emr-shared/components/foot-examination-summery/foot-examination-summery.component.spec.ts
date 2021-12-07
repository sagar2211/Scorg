import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FootExaminationSummeryComponent } from './foot-examination-summery.component';

describe('FootExaminationSummeryComponent', () => {
  let component: FootExaminationSummeryComponent;
  let fixture: ComponentFixture<FootExaminationSummeryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FootExaminationSummeryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FootExaminationSummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
