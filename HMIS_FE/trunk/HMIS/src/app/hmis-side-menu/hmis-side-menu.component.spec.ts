import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HMISSideMenuComponent } from './hmis-side-menu.component';

describe('HMISSideMenuComponent', () => {
  let component: HMISSideMenuComponent;
  let fixture: ComponentFixture<HMISSideMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HMISSideMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HMISSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
