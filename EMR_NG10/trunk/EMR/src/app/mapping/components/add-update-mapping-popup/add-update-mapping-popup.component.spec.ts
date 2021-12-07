import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateMappingPopupComponent } from './add-update-mapping-popup.component';

describe('AddUpdateMappingPopupComponent', () => {
  let component: AddUpdateMappingPopupComponent;
  let fixture: ComponentFixture<AddUpdateMappingPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateMappingPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateMappingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
