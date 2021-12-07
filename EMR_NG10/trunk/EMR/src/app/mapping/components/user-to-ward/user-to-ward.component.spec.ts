import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserToWardComponent } from './user-to-ward.component';

describe('UserToWardComponent', () => {
  let component: UserToWardComponent;
  let fixture: ComponentFixture<UserToWardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserToWardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserToWardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
