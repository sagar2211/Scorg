import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminationLabelAddUpdateComponent } from './examination-label-add-update.component';

describe('ExaminationLabelAddUpdateComponent', () => {
  let component: ExaminationLabelAddUpdateComponent;
  let fixture: ComponentFixture<ExaminationLabelAddUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExaminationLabelAddUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExaminationLabelAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
