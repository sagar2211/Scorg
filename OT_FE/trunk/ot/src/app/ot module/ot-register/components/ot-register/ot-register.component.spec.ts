import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtRegisterComponent } from './ot-register.component';

describe('OtRegisterComponent', () => {
  let component: OtRegisterComponent;
  let fixture: ComponentFixture<OtRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
