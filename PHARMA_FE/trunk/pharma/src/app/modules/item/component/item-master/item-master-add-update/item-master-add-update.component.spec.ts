import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemMasterAddUpdateComponent } from './item-master-add-update.component';

describe('ItemMasterAddUpdateComponent', () => {
  let component: ItemMasterAddUpdateComponent;
  let fixture: ComponentFixture<ItemMasterAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemMasterAddUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemMasterAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
