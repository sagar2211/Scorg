import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingSideMenuComponent } from './nursing-side-menu.component';

describe('NursingSideMenuComponent', () => {
  let component: NursingSideMenuComponent;
  let fixture: ComponentFixture<NursingSideMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingSideMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NursingSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
