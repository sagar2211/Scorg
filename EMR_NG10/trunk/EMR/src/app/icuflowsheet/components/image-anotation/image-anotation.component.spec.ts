import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageAnotationComponent } from './image-anotation.component';

describe('ImageAnotationComponent', () => {
  let component: ImageAnotationComponent;
  let fixture: ComponentFixture<ImageAnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageAnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageAnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
