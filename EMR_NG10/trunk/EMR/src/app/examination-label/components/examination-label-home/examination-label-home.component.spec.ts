import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminationLabelHomeComponent } from './examination-label-home.component';

describe('ExaminationLabelHomeComponent', () => {
  let component: ExaminationLabelHomeComponent;
  let fixture: ComponentFixture<ExaminationLabelHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExaminationLabelHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExaminationLabelHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
