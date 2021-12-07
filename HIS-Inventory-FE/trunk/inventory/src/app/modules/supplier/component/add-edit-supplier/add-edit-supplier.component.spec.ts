import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSupplierComponent } from './add-edit-supplier.component';

describe('AddEditSupplierComponent', () => {
  let component: AddEditSupplierComponent;
  let fixture: ComponentFixture<AddEditSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditSupplierComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
