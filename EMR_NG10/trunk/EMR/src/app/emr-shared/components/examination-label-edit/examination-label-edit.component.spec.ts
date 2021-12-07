import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminationLabelEditComponent } from './examination-label-edit.component';

describe('ExaminationLabelEditComponent', () => {
  let component: ExaminationLabelEditComponent;
  let fixture: ComponentFixture<ExaminationLabelEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExaminationLabelEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExaminationLabelEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
