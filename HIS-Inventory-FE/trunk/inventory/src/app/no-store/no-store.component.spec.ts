import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoStoreComponent } from './no-store.component';

describe('NoStoreComponent', () => {
  let component: NoStoreComponent;
  let fixture: ComponentFixture<NoStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoStoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
