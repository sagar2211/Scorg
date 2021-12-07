import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculesListComponent } from './molecules-list.component';

describe('MoleculesListComponent', () => {
  let component: MoleculesListComponent;
  let fixture: ComponentFixture<MoleculesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoleculesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoleculesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
