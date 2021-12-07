import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditOrderSetComponent } from './add-edit-order-set.component';

describe('AddEditOrderSetComponent', () => {
  let component: AddEditOrderSetComponent;
  let fixture: ComponentFixture<AddEditOrderSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditOrderSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditOrderSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
