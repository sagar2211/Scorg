import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionTemplateHomeComponent } from './prescription-template-home.component';

describe('PrescriptionTemplateHomeComponent', () => {
  let component: PrescriptionTemplateHomeComponent;
  let fixture: ComponentFixture<PrescriptionTemplateHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrescriptionTemplateHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionTemplateHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
