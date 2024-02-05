import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-checkout-modal',
  templateUrl: './checkout-modal.page.html',
  styleUrls: ['./checkout-modal.page.scss'],
})
export class CheckoutModalPage implements OnInit {
  deliveryAddress: string;
  paymentMethod: string;
  bankReference: string = ''; 

  constructor(private modalController: ModalController) {}
  ngOnInit() {}
  submitForm() {
    // Fechar a modal depois de inserir os dados
    this.modalController.dismiss({
      deliveryAddress: this.deliveryAddress,
      paymentMethod: this.paymentMethod,
      bankReference:this.bankReference,
    });
  }
}
