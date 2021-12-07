import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePolicySettingComponent } from './share-policy-setting.component';

describe('SharePolicySettingComponent', () => {
  let component: SharePolicySettingComponent;
  let fixture: ComponentFixture<SharePolicySettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharePolicySettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharePolicySettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
