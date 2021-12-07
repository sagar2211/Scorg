import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderLogComponent } from './slider-log.component';

describe('SliderLogComponent', () => {
  let component: SliderLogComponent;
  let fixture: ComponentFixture<SliderLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
