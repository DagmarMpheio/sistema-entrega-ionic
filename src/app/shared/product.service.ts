import { Injectable } from '@angular/core';
import { Product, ProductWithSupermarket } from '../../shared/product';
import { Supermarket } from '../../shared/supermarket';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { finalize, map, switchMap, catchError, tap, first } from 'rxjs/operators';
import { combineLatest, forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(
    private ngFirestore: AngularFirestore,
    private router: Router,
    private storage: AngularFireStorage
  ) {}

  // Novo produto
  /* createProduct(product: Product) {
    return this.ngFirestore.collection('produtos').add(product);
  } */
  async createProduct(product: Product, imageFile: File) {
    try {
      // Faz o upload da imagem
      const imageUrl = await this.uploadImage(imageFile);

      // Adiciona o URL da imagem ao objeto do produto
      product.imgUrl = imageUrl;

      // Adiciona o produto ao Firestore
      const docRef = await this.ngFirestore.collection('produtos').add(product);

      console.log(`Produto criado com ID: ${docRef.id}`);
    } catch (error) {
      console.error('Erro ao criar o produto:', error);
    }
  }

  // Obter produto pelo id
  getProduct(id: any) {
    return this.ngFirestore.collection('produtos').doc(id).valueChanges();
  }

  // Retorna um Observable de DocumentChangeAction<Product>[],
  // onde cada acção representa uma alteração (adicionar, modificar e excluír) em um documento na coleção 'produtos'.
  getProductList() {
    return this.ngFirestore.collection('produtos').snapshotChanges();
  }

  // Retorna um Observable de Product[], trazendo os dados actuais da coleção 'produtos'.
  // Não fornece informações detalhadas sobre alterações específicas nos documentos.
  getProducts(): Observable<Product[]> {
    return this.ngFirestore
      .collection('products')
      .snapshotChanges()
      .pipe(
        map((res) => {
          return res.map((t) => {
            return {
              id: t.payload.doc.id,
              ...(t.payload.doc.data() as Product),
            };
          });
        }),
        catchError((error) => {
          console.error('Error fetching products:', error);
          throw error;
        })
      );
  }

  // Obter List de produtos com detalhes do supermercado
  // Assuming ProductWithSupermarket type has properties like 'product' and 'supermarket'
  getProductsWithSupermarkets(): Observable<ProductWithSupermarket[]> {
    return forkJoin([this.getSupermarkets(), this.getProducts()]).pipe(
      tap(([supermarkets, products]) => {
        console.log('Supermarkets:', supermarkets);
        console.log('Products:', products);
      }),
      map(([supermarkets, products]) => {
        return products.map((product) => {
          const matchingSupermarket = supermarkets.find(
            (supermarket) => supermarket.$key === product.supermercadoId
          );
  
          return {
            product,
            supermarket: matchingSupermarket || ({} as Supermarket),
          } as ProductWithSupermarket;
        });
      }),
      catchError((error) => {
        console.error('Error combining supermarkets and products:', error);
        throw error;
      })
    );
  }
  

  getProductWithMarket() {
    const supermercadoCollection: AngularFirestoreCollection = this.ngFirestore.collection(`supermercados`);
    
    return supermercadoCollection.valueChanges().pipe(
      switchMap(supermercados => {
        const produtosObservable = supermercados.map((supermercado: any) => 
          this.ngFirestore.collection(`produtos`, ref => ref.where('supermercadoId', '==', supermercado.id).orderBy('nome')).valueChanges().pipe(first())
        );
  
        return combineLatest(...produtosObservable).pipe(
          map((...produtos: any) => {
            supermercados.forEach((supermercado, index) => {
              supermercado['produtos'] = produtos[index];
            });
            return supermercados;
          })
        );
      })
    );
  }  

  /* getProductsWithSupermarkets(): Observable<any[]> {
    return this.getProducts().pipe(
      switchMap(products => {
        const supermarketObservables: Observable<any>[] = products.map(product => {
          return this.ngFirestore.doc<Supermarket>(`supermercados/${product.supermercadoId}`).valueChanges().pipe(
            map(supermarket => ({ ...product, supermarket }))
          );
        });
        return forkJoin(supermarketObservables);
      })
    );
  } */

  // Obter produtos por supermercado
  getProductsByMarket(marketId: string) {
    return this.ngFirestore
      .collection('produtos', (ref) =>
        ref.where('supermercadoId', '==', marketId)
      )
      .snapshotChanges();
  }

  // Actualizar produto
  updateProduct(id: any, product: Product) {
    this.ngFirestore
      .collection('produtos')
      .doc(id)
      .update(product)
      .then(() => {
        this.router.navigate(['/product-list', product.supermercadoId]);
      })
      .catch((error) => console.log(error));
  }

  // excluir produto
  /*  deleteProduct(id: string) {
    this.ngFirestore.doc('produtos/' + id).delete();
  } */

  deleteProduct(id: string, imageUrl: string) {
    // Verificar se há uma URL de imagem associada ao produto
    if (imageUrl) {
      // Obter a referência do armazenamento a partir da URL da imagem
      const storageRef = this.storage.refFromURL(imageUrl);

      // Excluir a imagem do armazenamento
      storageRef.delete().subscribe(
        () => console.log('Imagem excluída com sucesso.'),
        (error) => console.error('Erro ao excluir imagem:', error)
      );
    }

    // Excluir o documento no Firestore
    this.ngFirestore.doc('produtos/' + id).delete();
  }

  // Obter produtos em promoção
  getPromotedProducts() {
    return this.ngFirestore
      .collection('produtos', (ref) => ref.where('emPromocao', '==', true))
      .snapshotChanges();
  }

  // Calcular preço com desconto
  calculateDiscountedPrice(preco: number, desconto: number): number {
    if (desconto && desconto > 0 && desconto <= 100) {
      const descontoDecimal = desconto / 100;
      const precoComDesconto = preco - preco * descontoDecimal;
      return parseFloat(precoComDesconto.toFixed(2)); // Arredondar para 2 casas decimais
    } else {
      return preco; // Retornar o preço sem desconto se o desconto for inválido
    }
  }

  //Método para obter a lista de supermercados
  getSupermarketsList() {
    return this.ngFirestore.collection('supermercados').snapshotChanges();
  }

  getSupermarkets(): Observable<Supermarket[]> {
    return this.ngFirestore
      .collection('supermarkets')
      .snapshotChanges()
      .pipe(
        map((res) => {
          return res.map((t) => {
            return {
              id: t.payload.doc.id,
              ...(t.payload.doc.data() as Supermarket),
            };
          });
        }),
        catchError((error) => {
          console.error('Error fetching supermarkets:', error);
          throw error;
        })
      );
  }

  // Marcar um produto como em promoção
  markProductAsPromotional(productId: string, desconto: number) {
    this.ngFirestore
      .collection('produtos')
      .doc(productId)
      .update({ emPromocao: true, desconto: desconto })
      .then(() => {
        console.log('Produto adicionado da promoção com sucesso.');
      })
      .catch((error) => {
        console.log('Erro ao adicionar o produto da promoção\nErro: ' + error);
      });
  }

  // Remover um produto da promoção
  removeProductFromPromotion(productId: any) {
    this.ngFirestore
      .collection('produtos')
      .doc(productId)
      .update({ emPromocao: false, desconto: 0 })
      .then(() => {
        console.log('Produto removido da promoção com sucesso.');
      })
      .catch((error) => {
        console.log('Erro ao remover o produto da promoção\nErro: ' + error);
      });
  }

  //metodo para fazer upload de imagens
  uploadImage(file: File) {
    const currentDate = Date.now();

    const filePath = `product_images/${currentDate}.jpg`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, file);

    return new Promise<string>((resolve, reject) => {
      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(() => {
            storageRef.getDownloadURL().subscribe(
              (downloadURL) => resolve(downloadURL),
              (error) => reject(error)
            );
          })
        )
        .subscribe();
    });
  }
}
