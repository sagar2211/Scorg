import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionTemplateListComponent } from './prescription-template-list.component';

describe('PrescriptionTemplateListComponent', () => {
  let component: PrescriptionTemplateListComponent;
  let fixture: ComponentFixture<PrescriptionTemplateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrescriptionTemplateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionTemplateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
