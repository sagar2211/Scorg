import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberOnlyInputComponent } from './number-only-input.component';

describe('NumberOnlyInputComponent', () => {
  let component: NumberOnlyInputComponent;
  let fixture: ComponentFixture<NumberOnlyInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberOnlyInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberOnlyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
