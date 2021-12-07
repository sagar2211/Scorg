import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FootExaminationComponent } from './foot-examination.component';

describe('FootExaminationComponent', () => {
  let component: FootExaminationComponent;
  let fixture: ComponentFixture<FootExaminationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FootExaminationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FootExaminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
