import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckoutModalPageRoutingModule } from './checkout-modal-routing.module';

import { CheckoutModalPage } from './checkout-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckoutModalPageRoutingModule
  ],
  declarations: [CheckoutModalPage]
})
export class CheckoutModalPageModule {}
