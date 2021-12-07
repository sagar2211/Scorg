import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculesAddUpdateComponent } from './molecules-add-update.component';

describe('MoleculesAddUpdateComponent', () => {
  let component: MoleculesAddUpdateComponent;
  let fixture: ComponentFixture<MoleculesAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoleculesAddUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoleculesAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
