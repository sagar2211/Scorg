import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateMainGroupComponent } from './add-update-main-group.component';

describe('AddUpdateMainGroupComponent', () => {
  let component: AddUpdateMainGroupComponent;
  let fixture: ComponentFixture<AddUpdateMainGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateMainGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateMainGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
