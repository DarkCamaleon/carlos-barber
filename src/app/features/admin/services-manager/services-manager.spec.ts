import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesManager } from './services-manager';

describe('ServicesManager', () => {
  let component: ServicesManager;
  let fixture: ComponentFixture<ServicesManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
