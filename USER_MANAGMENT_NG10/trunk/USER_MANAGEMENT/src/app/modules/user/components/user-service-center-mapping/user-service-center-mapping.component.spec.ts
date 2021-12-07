import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserServiceCenterMappingComponent } from './user-service-center-mapping.component';

describe('UserServiceCenterMappingComponent', () => {
  let component: UserServiceCenterMappingComponent;
  let fixture: ComponentFixture<UserServiceCenterMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserServiceCenterMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserServiceCenterMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
