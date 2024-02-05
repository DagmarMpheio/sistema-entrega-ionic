import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountModalPage } from './discount-modal.page';

describe('DiscountModalPage', () => {
  let component: DiscountModalPage;
  let fixture: ComponentFixture<DiscountModalPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DiscountModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
