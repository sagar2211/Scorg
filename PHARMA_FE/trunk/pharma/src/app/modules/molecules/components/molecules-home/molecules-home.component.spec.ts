import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculesHomeComponent } from './molecules-home.component';

describe('MoleculesHomeComponent', () => {
  let component: MoleculesHomeComponent;
  let fixture: ComponentFixture<MoleculesHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoleculesHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoleculesHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
