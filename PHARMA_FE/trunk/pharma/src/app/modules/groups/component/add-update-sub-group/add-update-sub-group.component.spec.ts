import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateSubGroupComponent } from './add-update-sub-group.component';

describe('AddUpdateSubGroupComponent', () => {
  let component: AddUpdateSubGroupComponent;
  let fixture: ComponentFixture<AddUpdateSubGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateSubGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateSubGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
