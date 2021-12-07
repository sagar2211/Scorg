import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FootExaminationPopupComponent } from './foot-examination-popup.component';

describe('FootExaminationPopupComponent', () => {
  let component: FootExaminationPopupComponent;
  let fixture: ComponentFixture<FootExaminationPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FootExaminationPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FootExaminationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
