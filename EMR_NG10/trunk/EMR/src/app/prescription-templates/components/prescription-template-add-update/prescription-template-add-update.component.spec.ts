import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionTemplateAddUpdateComponent } from './prescription-template-add-update.component';

describe('PrescriptionTemplateAddUpdateComponent', () => {
  let component: PrescriptionTemplateAddUpdateComponent;
  let fixture: ComponentFixture<PrescriptionTemplateAddUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrescriptionTemplateAddUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionTemplateAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
