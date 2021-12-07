import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationSideMenuComponent } from './communication-side-menu.component';

describe('CommunicationSideMenuComponent', () => {
  let component: CommunicationSideMenuComponent;
  let fixture: ComponentFixture<CommunicationSideMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunicationSideMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
