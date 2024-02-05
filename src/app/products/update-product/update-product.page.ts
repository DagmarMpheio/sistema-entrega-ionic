import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../shared/product.service';
import { Supermarket } from '../../../shared/supermarket';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController  } from '@ionic/angular';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.page.html',
  styleUrls: ['./update-product.page.scss'],
})
export class UpdateProductPage implements OnInit {
  editProductForm: FormGroup;
  id: any;

  constructor(
    private productService: ProductService,
    public formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController 
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.productService.getProduct(this.id).subscribe((data: any) => {
      this.editProductForm = this.formBuilder.group({
        nome: [data['nome']],
        preco: [data['preco']],
        descricao: [data['descricao']],
        imgUrl: [data['imgUrl']],
        supermercadoId: [data['supermercadoId']],
      });
    });
  }

  ngOnInit() {
    this.editProductForm = this.formBuilder.group({
      nome: ['', Validators.required],
      preco: [0, [Validators.required, Validators.min(0)]],
      descricao: ['', Validators.required],
      emPromocao: [false],
      desconto: [0, [Validators.min(0), Validators.max(100)]],
      imgUrl: [''],
      supermercadoId: ['', Validators.required],
    });
  }

  formSubmit() {
    this.productService.updateProduct(this.id, this.editProductForm.value);
    this.presentSuccessAlert();
  }

  async presentSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Sucesso!',
      message: 'Produto actualizado com sucesso.',
      buttons: ['OK']
    });

    await alert.present();
  }
}
