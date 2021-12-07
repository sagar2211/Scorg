import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoCapturePopupComponent } from './photo-capture-popup.component';

describe('PhotoCapturePopupComponent', () => {
  let component: PhotoCapturePopupComponent;
  let fixture: ComponentFixture<PhotoCapturePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhotoCapturePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoCapturePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
