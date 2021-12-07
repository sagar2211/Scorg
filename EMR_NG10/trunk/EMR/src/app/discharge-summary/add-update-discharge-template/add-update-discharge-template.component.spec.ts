import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateDischargeTemplateComponent } from './add-update-discharge-template.component';

describe('AddUpdateDischargeTemplateComponent', () => {
  let component: AddUpdateDischargeTemplateComponent;
  let fixture: ComponentFixture<AddUpdateDischargeTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateDischargeTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateDischargeTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
