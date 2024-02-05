import { Product } from './product';

export class Cart {
  id?: string;
  nome?: string;
  imgUrl?: string;
  quantity: number;
  product: Product;
  price: number;
  subtotal: number;

  toJson(): any {
    return {
      quantity: this.quantity,
      nome: this.product.nome,
      imgUrl: this.product.imgUrl,
      product: this.product,
      price: this.price,
      subtotal: this.subtotal,
    };
  }
}
