import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductListPageRoutingModule } from './product-list-routing.module';

import { ProductListPage } from './product-list.page';
import { DiscountService } from '../../shared/discount.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductListPageRoutingModule
  ],
  declarations: [ProductListPage],
  providers: [
    DiscountService,  // Registrar o serviço aqui
  ],
})
export class ProductListPageModule {}
