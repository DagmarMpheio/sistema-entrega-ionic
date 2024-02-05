import { Component } from '@angular/core';
import { CartService } from '../shared/cart.service';
import { Cart } from 'src/shared/cart';
import { OrdersService } from '../shared/orders.service';
import { Order } from 'src/shared/order';
import { ModalController, AlertController } from '@ionic/angular';
import { CheckoutModalPage } from '../products/checkout-modal/checkout-modal.page';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/shared/authentication-service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  cartItems: Cart[] = [];

  constructor(
    private cartService: CartService,
    private orderService: OrdersService,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
    public authService: AuthenticationService
  ) {}

  userData:any;

  ngOnInit() {
    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
    });

    // Obter o UID no localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userData=user;
  }

  async addToCart(productId: string): Promise<void> {
    const product = await this.cartService
      .getProductById(productId)
      .toPromise();

    if (product) {
      this.cartService.addToCart(product);
    }
  }

  get total() {
    return this.cartService.total;
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  getCartItemsType(): string {
    return typeof this.cartItems;
  }

  async continuarCompra() {
    const modal = await this.modalController.create({
      component: CheckoutModalPage,
    });

    // Obter o UID no localStorage
    const userUID = JSON.parse(localStorage.getItem('user') || '{}').uid;

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        // Criar uma instância de Order com os dados do carrinho e outros detalhes necessários
        const compraInfo = new Order();
        compraInfo.userId = userUID;
        compraInfo.formaPagamento = data.data.paymentMethod;
        compraInfo.status = 'Pendente';
        compraInfo.endereco = data.data.deliveryAddress;
        compraInfo.total = this.total;
        compraInfo.items = this.cartItems;
        compraInfo.dataHoraCompra = new Date().toISOString();

        // Add  referencia bancaria se a forma de pagamento for "Referência Bancária"
        if (data.data.paymentMethod === 'Referência Bancária') {
          compraInfo.referenciaBancaria = data.data.bankReference;
        } else {
          compraInfo.referenciaBancaria = '';
        }

        console.log('compraInfo: ', compraInfo);

        this.orderService
          .continuarComprar(compraInfo)
          .then(() => {
            this.cartService.clearCart();
            console.log('A compra foi registrada com sucesso!');
            this.router.navigate(['/tabs/tab3']);
            this.presentSuccessAlert('A compra foi efectuada com sucesso!');
          })
          .catch((error) => {
            console.error('Erro ao registrar a compra:', error);
          });
      }
    });

    return await modal.present();
  }

  async presentSuccessAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Sucesso!',
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
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
