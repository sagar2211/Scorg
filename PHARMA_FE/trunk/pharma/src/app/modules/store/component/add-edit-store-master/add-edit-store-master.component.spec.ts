import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditStoreMasterComponent } from './add-edit-store-master.component';

describe('AddEditStoreMasterComponent', () => {
  let component: AddEditStoreMasterComponent;
  let fixture: ComponentFixture<AddEditStoreMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditStoreMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditStoreMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
