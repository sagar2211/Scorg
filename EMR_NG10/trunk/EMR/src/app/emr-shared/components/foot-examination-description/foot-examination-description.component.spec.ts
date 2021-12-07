import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FootExaminationDescriptionComponent } from './foot-examination-description.component';

describe('FootExaminationDescriptionComponent', () => {
  let component: FootExaminationDescriptionComponent;
  let fixture: ComponentFixture<FootExaminationDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FootExaminationDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FootExaminationDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
