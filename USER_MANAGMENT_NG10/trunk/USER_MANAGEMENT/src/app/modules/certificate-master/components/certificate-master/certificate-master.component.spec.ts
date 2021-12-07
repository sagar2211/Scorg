import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateMasterComponent } from './certificate-master.component';

describe('CertificateMasterComponent', () => {
  let component: CertificateMasterComponent;
  let fixture: ComponentFixture<CertificateMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
