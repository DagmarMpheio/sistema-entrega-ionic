import { Component, OnInit } from '@angular/core';
import { Product } from '../../../shared/product';
import { ProductService } from '../../shared/product.service';
import { AlertController, ModalController } from '@ionic/angular';
import { DiscountModalPage } from '../discount-modal/discount-modal.page';
import { DiscountService } from '../../shared/discount.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit {
  products: Product[] = [];
  desconto: number;
  supermarketId: any;

  constructor(
    public productService: ProductService,
    private alertController: AlertController,
    private modalController: ModalController,
    private discountService: DiscountService,
    private route: ActivatedRoute,
  ) {}

  loading = true;

  ngOnInit() {
    // Obtenha o parâmetro da rota
    this.supermarketId = this.route.snapshot.paramMap.get('supermarketId');

    this.productService.getProductsByMarket(this.supermarketId).subscribe((res) => {
      this.products = res.map((t) => {
        return {
          id: t.payload.doc.id,
          ...(t.payload.doc.data() as Product),
        };
      });
      this.loading = false; // Marcar como carregado quando os dados estiverem disponíveis
    });
  }

  productList() {
    this.productService.getProductList().subscribe((data) => {
      console.log(data);
    });
  }

  remove(id: string, imageUrl: string) {
    console.log(id);
    if (window.confirm('Tem a certeza que deseja excluir?')) {
      this.productService.deleteProduct(id, imageUrl);
      this.presentSuccessAlert('Produto excluído com sucesso.');
    }
  }

  // Abrir a modal para inserir desconto
  async openDiscountModal(id: any): Promise<void> {
    const modal = await this.modalController.create({
      component: DiscountModalPage,
    });

    modal.onDidDismiss().then((data) => {
      this.desconto = this.discountService.getDesconto();
      this.productService.markProductAsPromotional(id, this.desconto);
      console.log('Desconto aplicado:', this.desconto);
      this.presentSuccessAlert('Produto adicionado na promoção sucesso.');
    });

    await modal.present();
  }

  /* makePromotional(id: any) {
    this.productService.markProductAsPromotional(id, this.desconto);
    console.log('Desconto aplicado agora:', this.desconto);
  } */

  removePromotional(id: any) {
    console.log(id);
    if (window.confirm('Tem a certeza que deseja remover da promoção?')) {
      this.productService.removeProductFromPromotion(id);
      this.presentSuccessAlert('Produto removido da promoção sucesso.');
    }
  }

  async presentSuccessAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Sucesso!',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
