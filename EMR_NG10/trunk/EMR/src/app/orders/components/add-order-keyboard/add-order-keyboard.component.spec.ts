import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrderKeyboardComponent } from './add-order-keyboard.component';

describe('AddOrderKeyboardComponent', () => {
  let component: AddOrderKeyboardComponent;
  let fixture: ComponentFixture<AddOrderKeyboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddOrderKeyboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrderKeyboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
