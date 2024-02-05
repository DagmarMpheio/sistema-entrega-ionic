import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiscountModalPage } from './discount-modal.page';

const routes: Routes = [
  {
    path: '',
    component: DiscountModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiscountModalPageRoutingModule {}
