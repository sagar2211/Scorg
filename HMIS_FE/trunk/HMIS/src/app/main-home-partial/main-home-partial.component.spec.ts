import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainHomePartialComponent } from './main-home-partial.component';

describe('MainHomePartialComponent', () => {
  let component: MainHomePartialComponent;
  let fixture: ComponentFixture<MainHomePartialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainHomePartialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainHomePartialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
