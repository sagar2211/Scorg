import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentHomeComponent } from './consent-home.component';

describe('ConsentHomeComponent', () => {
  let component: ConsentHomeComponent;
  let fixture: ComponentFixture<ConsentHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsentHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsentHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
