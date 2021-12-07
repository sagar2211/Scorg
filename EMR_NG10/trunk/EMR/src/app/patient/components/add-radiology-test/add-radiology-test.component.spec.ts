import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRadiologyTestComponent } from './add-radiology-test.component';

describe('AddRadiologyTestComponent', () => {
  let component: AddRadiologyTestComponent;
  let fixture: ComponentFixture<AddRadiologyTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRadiologyTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRadiologyTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
