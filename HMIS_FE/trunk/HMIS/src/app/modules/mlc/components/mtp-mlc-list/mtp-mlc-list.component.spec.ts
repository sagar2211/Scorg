import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtpMlcListComponent } from './mtp-mlc-list.component';

describe('MtpMlcListComponent', () => {
  let component: MtpMlcListComponent;
  let fixture: ComponentFixture<MtpMlcListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtpMlcListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MtpMlcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
