import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTaxMasterComponent } from './add-edit-tax-master.component';

describe('AddEditTaxMasterComponent', () => {
  let component: AddEditTaxMasterComponent;
  let fixture: ComponentFixture<AddEditTaxMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditTaxMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditTaxMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
