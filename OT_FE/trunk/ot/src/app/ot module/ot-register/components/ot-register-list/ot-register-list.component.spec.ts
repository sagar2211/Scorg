import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtRegisterListComponent } from './ot-register-list.component';

describe('OtRegisterListComponent', () => {
  let component: OtRegisterListComponent;
  let fixture: ComponentFixture<OtRegisterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtRegisterListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtRegisterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
