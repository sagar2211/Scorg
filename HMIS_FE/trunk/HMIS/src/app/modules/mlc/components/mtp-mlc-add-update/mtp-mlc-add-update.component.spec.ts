import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtpMlcAddUpdateComponent } from './mtp-mlc-add-update.component';

describe('MtpMlcAddUpdateComponent', () => {
  let component: MtpMlcAddUpdateComponent;
  let fixture: ComponentFixture<MtpMlcAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtpMlcAddUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MtpMlcAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
