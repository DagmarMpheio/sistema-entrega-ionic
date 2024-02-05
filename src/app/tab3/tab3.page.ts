import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from 'src/shared/order';
import { OrdersService } from '../shared/orders.service';
import { AuthenticationService } from 'src/shared/authentication-service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  orders$: Observable<Order[]>;
  selectedOrder: Order | null = null;

  constructor(
    private ordersService: OrdersService,
    private alertController: AlertController,
    public authService: AuthenticationService
  ) {}

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

  ngOnInit(): void {
    this.orders$ = this.ordersService.getOrdersForAuthenticatedUser();
  }

  showOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  hideOrderDetails(): void {
    this.selectedOrder = null;
  }
}
