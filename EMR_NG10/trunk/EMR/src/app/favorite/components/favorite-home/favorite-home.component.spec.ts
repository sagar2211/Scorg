import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteHomeComponent } from './favorite-home.component';

describe('FavoriteHomeComponent', () => {
  let component: FavoriteHomeComponent;
  let fixture: ComponentFixture<FavoriteHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavoriteHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
