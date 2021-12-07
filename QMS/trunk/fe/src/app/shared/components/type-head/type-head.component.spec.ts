import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeHeadComponent } from './type-head.component';

describe('TypeHeadComponent', () => {
  let component: TypeHeadComponent;
  let fixture: ComponentFixture<TypeHeadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeHeadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
