import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { Order } from 'src/shared/order';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private ordersCollection: AngularFirestoreCollection<Order>;

  constructor(private ngFirestore: AngularFirestore) {
    this.ordersCollection = this.ngFirestore.collection<Order>('pedidos');
  }

  continuarComprar(order: Order) {
    const pedidosCollection = this.ngFirestore.collection('pedidos');

    // Adiciona um novo documento à coleção "pedidos" com os dados da compra
    return pedidosCollection
      .add(order.toJSON())
      .then(() => {
        console.log('Compra registrada com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao registrar a compra:', error);
      });
  }

  //obter todos os pedidos
  getAllOrders(): Observable<Order[]> {
    return this.ordersCollection.valueChanges();
  }

  //obter os pedidos do usuario autenticado
  getOrdersForAuthenticatedUser(): Observable<Order[]> {
    // Obter o UID no localStorage
    const userUID = JSON.parse(localStorage.getItem('user') || '{}').uid;
  
    if (userUID) {
      return this.ngFirestore
        .collection<Order>('pedidos', (ref) =>
          ref.where('userId', '==', userUID).orderBy('dataHoraCompra', 'desc')
        )
        .valueChanges();
    } else {
      // Retorna um Observable vazio se o UID não estiver presente
      return of([]);
    }
  }
  
}
