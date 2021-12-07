import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddImageAnnotationComponent } from './add-image-annotation.component';

describe('AddImageAnnotationComponent', () => {
  let component: AddImageAnnotationComponent;
  let fixture: ComponentFixture<AddImageAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddImageAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddImageAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
