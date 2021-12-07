import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitMasterAddUpdateComponent } from './kit-master-add-update.component';

describe('KitMasterAddUpdateComponent', () => {
  let component: KitMasterAddUpdateComponent;
  let fixture: ComponentFixture<KitMasterAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KitMasterAddUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KitMasterAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
