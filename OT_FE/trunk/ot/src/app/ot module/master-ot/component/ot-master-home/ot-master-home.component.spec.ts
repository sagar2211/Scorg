import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtMasterHomeComponent } from './ot-master-home.component';

describe('OtMasterHomeComponent', () => {
  let component: OtMasterHomeComponent;
  let fixture: ComponentFixture<OtMasterHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtMasterHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtMasterHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
