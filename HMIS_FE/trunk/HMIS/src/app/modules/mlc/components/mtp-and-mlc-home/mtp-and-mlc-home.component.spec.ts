import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtpAndMlcHomeComponent } from './mtp-and-mlc-home.component';

describe('MtpAndMlcHomeComponent', () => {
  let component: MtpAndMlcHomeComponent;
  let fixture: ComponentFixture<MtpAndMlcHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtpAndMlcHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MtpAndMlcHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
