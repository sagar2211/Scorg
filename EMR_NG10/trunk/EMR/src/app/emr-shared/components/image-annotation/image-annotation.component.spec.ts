import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageAnnotationComponent } from './image-annotation.component';

describe('ImageAnnotationComponent', () => {
  let component: ImageAnnotationComponent;
  let fixture: ComponentFixture<ImageAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
