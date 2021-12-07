import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomListboxComponent } from './custom-listbox.component';

describe('CustomListboxComponent', () => {
  let component: CustomListboxComponent;
  let fixture: ComponentFixture<CustomListboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomListboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomListboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
