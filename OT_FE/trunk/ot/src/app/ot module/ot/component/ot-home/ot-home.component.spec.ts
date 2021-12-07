import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtHomeComponent } from './ot-home.component';

describe('OtHomeComponent', () => {
  let component: OtHomeComponent;
  let fixture: ComponentFixture<OtHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
