import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStoreMappingListComponent } from './user-store-mapping-list.component';

describe('UserStoreMappingListComponent', () => {
  let component: UserStoreMappingListComponent;
  let fixture: ComponentFixture<UserStoreMappingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserStoreMappingListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserStoreMappingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
