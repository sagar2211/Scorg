import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminationLabelListComponent } from './examination-label-list.component';

describe('ExaminationLabelListComponent', () => {
  let component: ExaminationLabelListComponent;
  let fixture: ComponentFixture<ExaminationLabelListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExaminationLabelListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExaminationLabelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
