import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateItemTypeComponent } from './add-update-item-type.component';

describe('AddUpdateItemTypeComponent', () => {
  let component: AddUpdateItemTypeComponent;
  let fixture: ComponentFixture<AddUpdateItemTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateItemTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateItemTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
