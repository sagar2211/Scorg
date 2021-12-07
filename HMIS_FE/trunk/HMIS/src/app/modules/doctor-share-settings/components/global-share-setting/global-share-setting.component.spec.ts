import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalShareSettingComponent } from './global-share-setting.component';

describe('GlobalShareSettingComponent', () => {
  let component: GlobalShareSettingComponent;
  let fixture: ComponentFixture<GlobalShareSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalShareSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalShareSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
