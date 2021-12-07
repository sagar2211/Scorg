import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadImageAnnotationFileComponent } from './upload-image-annotation-file.component';

describe('UploadImageAnnotationFileComponent', () => {
  let component: UploadImageAnnotationFileComponent;
  let fixture: ComponentFixture<UploadImageAnnotationFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadImageAnnotationFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadImageAnnotationFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
