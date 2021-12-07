import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitMasterHomeComponent } from './kit-master-home.component';

describe('KitMasterHomeComponent', () => {
  let component: KitMasterHomeComponent;
  let fixture: ComponentFixture<KitMasterHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KitMasterHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KitMasterHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
