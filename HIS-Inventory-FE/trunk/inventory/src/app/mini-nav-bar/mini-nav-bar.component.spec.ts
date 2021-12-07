import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniNavBarComponent } from './mini-nav-bar.component';

describe('MiniNavBarComponent', () => {
  let component: MiniNavBarComponent;
  let fixture: ComponentFixture<MiniNavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniNavBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
