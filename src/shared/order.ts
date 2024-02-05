import { Cart } from './cart';

export class Order {
  $key: String;
  formaPagamento: string;
  referenciaBancaria?: string;
  status: string;
  userId: string;
  endereco: string;
  total: number;
  items: Cart[];
  dataHoraCompra: string;

  toJSON() {
    return {
      formaPagamento: this.formaPagamento,
      referenciaBancaria:this.referenciaBancaria,
      status: this.status,
      userId: this.userId,
      endereco: this.endereco,
      total: this.total,
      items: this.items.map((item) => ({
        nome:item.product.nome,
        imgUrl:item.product.imgUrl,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      dataHoraCompra: this.dataHoraCompra,
    };
  }
}
