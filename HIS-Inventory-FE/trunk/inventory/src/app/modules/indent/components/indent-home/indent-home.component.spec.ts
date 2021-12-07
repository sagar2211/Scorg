import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndentHomeComponent } from './indent-home.component';

describe('IndentHomeComponent', () => {
  let component: IndentHomeComponent;
  let fixture: ComponentFixture<IndentHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndentHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndentHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
