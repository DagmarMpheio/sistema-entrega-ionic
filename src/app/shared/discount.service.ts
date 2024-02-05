import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DiscountService {

  private desconto: number;

  setDesconto(valor: number): void {
    this.desconto = valor;
  }

  getDesconto(): number {
    return this.desconto;
  }

  constructor() { }
}
