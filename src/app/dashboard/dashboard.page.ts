import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../shared/authentication-service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  constructor(
    private alertController: AlertController,
    public authService: AuthenticationService
  ) {}
  userData:any;

  ngOnInit() {
    // Obter o UID no localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userData=user;
  }

  async confirmSignOut() {
    const alert = await this.alertController.create({
      header: 'Confirmar Saída',
      message: 'Tem certeza de que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          handler: () => {
            this.authService.SignOut();
          }
        }
      ]
    });

    await alert.present();
  }
}
