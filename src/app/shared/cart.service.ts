import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart } from 'src/shared/cart';
import { Product } from 'src/shared/product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemsSubject: BehaviorSubject<Cart[]> = new BehaviorSubject<
    Cart[]
  >([]);
  cartItems$: Observable<Cart[]> = this.cartItemsSubject.asObservable();
  total: number = 0; // Total do valor monetário
  totalItems: number = 0; // Total de itens no carrinho

  private readonly localStorageKey = 'cartItems'; // Chave para armazenar dados no localStorage

  constructor(private firestore: AngularFirestore) {
    // Recupera os itens do carrinho do localStorage ao iniciar o serviço
    const storedCartItems = localStorage.getItem(this.localStorageKey);
    if (storedCartItems) {
      this.cartItemsSubject.next(JSON.parse(storedCartItems));
      this.calculateTotal(JSON.parse(storedCartItems));
    }
  }

  getCartItems(): Cart[] {
    return this.cartItemsSubject.getValue();
  }

  /* addToCart(product: Product): void {
    const currentItems = this.getCartItems();
    const cartItem: Cart = {
      quantity: 1,
      product: product,
      productId: product.$key,
      price: product.preco,
      subtotal: product.preco,
    };
    const updatedItems = [...currentItems, cartItem];
    this.cartItemsSubject.next(updatedItems);
  } */

  addToCart(product: Product): void {
    const currentItems = this.getCartItems();
    const existingItem = currentItems.find((item) => item.product === product);

    if (existingItem) {
      // Se o item já estiver no carrinho, incrementa a quantidade
      existingItem.quantity += 1;
      existingItem.subtotal = existingItem.quantity * existingItem.price!;
    } else {
      // Se o item não estiver no carrinho, adiciona um novo item
      const cartItem = new Cart();
      cartItem.quantity = 1;
      cartItem.product = product;

      // Verifica se o produto está em promoção e calcula o preço correspondente
      if (product.emPromocao) {
        cartItem.price = this.calculateDiscountedPrice(
          product.preco,
          product.desconto || 0
        );
        cartItem.subtotal = this.calculateDiscountedPrice(
          product.preco,
          product.desconto || 0
        );
      } else {
        cartItem.price = product.preco;
        cartItem.subtotal = product.preco;
      }

      currentItems.push(cartItem.toJson());
    }

    this.cartItemsSubject.next([...currentItems]);
    this.calculateTotal(currentItems);
    this.updateLocalStorage(currentItems);
  }

  removeFromCart(productId: string): void {
    const currentItems = this.getCartItems();
    const existingItemIndex = currentItems.findIndex(
      (item) => item.product.$key === productId
    );

    if (existingItemIndex !== -1) {
      // Se o item já estiver no carrinho e a quantidade for maior que 1, decrementa a quantidade
      if (currentItems[existingItemIndex].quantity > 1) {
        currentItems[existingItemIndex].quantity -= 1;
        currentItems[existingItemIndex].subtotal =
          currentItems[existingItemIndex].quantity *
          currentItems[existingItemIndex].price!;
      } else {
        // Se a quantidade for 1, remove completamente o item
        currentItems.splice(existingItemIndex, 1);
      }

      this.cartItemsSubject.next([...currentItems]);
      this.calculateTotal(currentItems);
      this.updateLocalStorage(currentItems);
    }
  }

  /* removeFromCart(cartItemId: string): void {
    const currentItems = this.getCartItems();
    const updatedItems = currentItems.filter((item) => item.id !== cartItemId);
    this.cartItemsSubject.next(updatedItems);
  } */

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.total = 0;
    this.totalItems = 0;
    localStorage.removeItem(this.localStorageKey);
  }

  // Método para calcular o total do carrinho
  private calculateTotal(items: Cart[]): void {
    this.total = items.reduce((acc, item) => acc + item.subtotal, 0) + 500; //taxa fixa de 500kz
    this.totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  }

  // Método para buscar um produto pelo ID
  getProductById(productId: string): Observable<Product | undefined> {
    return this.firestore
      .collection('produtos')
      .doc<Product>(productId)
      .valueChanges();
  }

  //actualizar os dados os localStorage
  private updateLocalStorage(cartItems: Cart[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(cartItems));
  }

  // Método para calcular o preço com desconto
  private calculateDiscountedPrice(
    price: number,
    discountPercentage: number
  ): number {
    const discountAmount = (discountPercentage / 100) * price;
    return price - discountAmount;
  }
}
