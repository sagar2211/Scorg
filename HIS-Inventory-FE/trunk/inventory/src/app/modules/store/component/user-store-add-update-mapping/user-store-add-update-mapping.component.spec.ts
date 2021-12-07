import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStoreAddUpdateMappingComponent } from './user-store-add-update-mapping.component';

describe('UserStoreAddUpdateMappingComponent', () => {
  let component: UserStoreAddUpdateMappingComponent;
  let fixture: ComponentFixture<UserStoreAddUpdateMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserStoreAddUpdateMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserStoreAddUpdateMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
