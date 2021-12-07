import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleFootExaminationComponent } from './single-foot-examination.component';

describe('SingleFootExaminationComponent', () => {
  let component: SingleFootExaminationComponent;
  let fixture: ComponentFixture<SingleFootExaminationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleFootExaminationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleFootExaminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
