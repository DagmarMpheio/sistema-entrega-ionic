import { Component, OnInit } from '@angular/core';
import { Supermarket } from '../../../shared/supermarket';
import { ProductService } from '../../shared/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.page.html',
  styleUrls: ['./shops.page.scss'],
})
export class ShopsPage implements OnInit {
  supermercados: Supermarket[];

  constructor(public productService: ProductService, private router: Router) {}
  
  loading = true;

  ngOnInit() {
    // Obter a lista de supermercados
    this.productService.getSupermarketsList().subscribe((data) => {
      this.supermercados = data.map((e) => {
        return {
          id: e.payload.doc.id,
          ...(e.payload.doc.data() as Supermarket),
        };
      });
      this.loading = false; // Marcar como carregado quando os dados estiverem disponíveis
    });
  }

  shopDetails(supermercadoId: string) {
    // Navegar para a rota de produtos com o supermercadoId na URL
    this.router.navigate(['/product-list', supermercadoId]);
  }
}
