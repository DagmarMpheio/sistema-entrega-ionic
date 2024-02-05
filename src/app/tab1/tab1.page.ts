import { Component, OnInit } from '@angular/core';
import { Product, ProductWithSupermarket } from '../../shared/product';
import { ProductService } from '../shared/product.service';
import { Observable } from 'rxjs';
import { CartService } from '../shared/cart.service';
import { Cart } from 'src/shared/cart';
import { AlertController } from '@ionic/angular';
import { AuthenticationService } from 'src/shared/authentication-service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  products: Product[] = [];
  cartItems: Cart[] = [];
  supermercados: any[] = [];
  productsWithSupermarkets: ProductWithSupermarket[] = [];

  constructor(
    public productService: ProductService,
    private cartService: CartService,
    private alertController: AlertController,
    public authService: AuthenticationService
  ) {}

  loading = true;

  ngOnInit() {
    /* this.productService.getProductsWithSupermarkets().subscribe((result) => {
      this.productsWithSupermarkets = result;
      console.log('supermercados2: ', this.productsWithSupermarkets);
    }); */
    console.log('supermercados2: ', this.productsWithSupermarkets);
    /* this.productService.getProductWithMarket().subscribe((supermercados) => {
      console.log('supermercados: ', this.supermercados);
    }); */

    this.productService.getProductList().subscribe((res) => {
      this.products = res.map((t) => {
        return {
          id: t.payload.doc.id,
          ...(t.payload.doc.data() as Product),
        };
      });
      this.loading = false; // Marcar como carregado quando os dados estiverem disponíveis
    });

    //carrinho
    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  async confirmSignOut() {
    const alert = await this.alertController.create({
      header: 'Confirmar Saída',
      message: 'Tem certeza de que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Sair',
          handler: () => {
            this.authService.SignOut();
          },
        },
      ],
    });

    await alert.present();
  }
}
