import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditManufacturerComponent } from './add-edit-manufacturer.component';

describe('AddEditManufacturerComponent', () => {
  let component: AddEditManufacturerComponent;
  let fixture: ComponentFixture<AddEditManufacturerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditManufacturerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditManufacturerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
