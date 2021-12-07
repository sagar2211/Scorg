import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtRegisterHomeComponent } from './ot-register-home.component';

describe('OtRegisterHomeComponent', () => {
  let component: OtRegisterHomeComponent;
  let fixture: ComponentFixture<OtRegisterHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtRegisterHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtRegisterHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
