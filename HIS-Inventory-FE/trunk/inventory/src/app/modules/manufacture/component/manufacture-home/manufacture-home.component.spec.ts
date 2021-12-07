import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufactureHomeComponent } from './manufacture-home.component';

describe('ManufactureHomeComponent', () => {
  let component: ManufactureHomeComponent;
  let fixture: ComponentFixture<ManufactureHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManufactureHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufactureHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
