import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiscountModalPageRoutingModule } from './discount-modal-routing.module';

import { DiscountModalPage } from './discount-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiscountModalPageRoutingModule
  ],
  declarations: [DiscountModalPage]
})
export class DiscountModalPageModule {}
