import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseDashboard } from './warehouse-dashboard';

describe('WarehouseDashboard', () => {
  let component: WarehouseDashboard;
  let fixture: ComponentFixture<WarehouseDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
