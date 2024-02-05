import { Injectable, NgZone } from '@angular/core';
import * as auth from 'firebase/auth';
import { User } from './user';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  userData: any;
  constructor(
    public afStore: AngularFirestore,
    public ngFireAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone
  ) {
    /* this.ngFireAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user') || '{}');
      } else {
        localStorage.setItem('user', null || '{}');
        JSON.parse(localStorage.getItem('user') || '{}');
      }
    }); */

    //assim que o usuario fazer autenticacao, obter os dados do mesmo e armazenar no local storage para mantê-lo autenticado
    // caso os dados nao estejam armazenado, o objecto json fica vazio
    this.ngFireAuth.authState.subscribe((user) => {
      if (user) {
        this.getUserDataByUserId(user.uid).subscribe((userData) => {
          if (userData) {
            // Obter o valor de isAdmin do Firestore ou define como false se não existir
            const isAdmin = userData.isAdmin || false;
            // Armazenar isAdmin separadamente no localStorage
            localStorage.setItem('isAdmin', isAdmin.toString());
          } else {
            console.error('Dados do usuário não encontrados.');
            // Armazenar isAdmin separadamente no localStorage
            localStorage.setItem('isAdmin', 'false');
          }
        });
        // Armazenar o objeto user no localStorage
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // Se o usuário não está autenticado, armazena um objeto de usuário vazio no localStorage
        this.userData = null;
        localStorage.setItem('user', JSON.stringify({}));

        // Remove a informação isAdmin do localStorage
        localStorage.removeItem('isAdmin');
      }
    });
  }

  // Login com email e password
  SignIn(email: any, password: any) {
    let isAdmin = false;

    return this.ngFireAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        if (result.user) {
          this.getUserDataByUserId(result.user.uid).subscribe((userData) => {
            if (userData) {
              isAdmin = userData.isAdmin || false;
              this.SetUserData(result.user, isAdmin);
            } else {
              console.error('Dados do usuário não encontrados.');
              this.SetUserData(result.user, isAdmin);
            }
          });
        } else {
          console.error('Usuário não encontrado após o login.');
        }
      });
  }
  // Registar usuario com email e password
  RegisterUser(email: any, password: any) {
    return this.ngFireAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.SetUserData(result.user, false);
      });
  }

  // Enviar Email  de verificacao quando um novo usuario regista-se
  SendVerificationMail() {
    return this.ngFireAuth.currentUser.then((user: any) => {
      return user.sendEmailVerification().then(() => {
        this.router.navigate(['verify-email']);
      });
    });
  }

  /* SendVerificationMail() {
    return this.ngFireAuth.auth.currentUser.sendEmailVerification()
    .then(() => {
      this.router.navigate(['verify-email']);
    })
  } */

  // Repôr password
  PasswordRecover(passwordResetEmail: any) {
    return this.ngFireAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert(
          'O e-mail de redefinição da palavra-passe foi enviado, verifique a sua caixa de entrada.'
        );
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  // Retorna verdadeiro se o usuario esta autenticado
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user !== null;
  }  

  // Retornar verdadeiro se o email do usuario foi verificado
  get isEmailVerified(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.emailVerified !== false ? true : false;
  }

  // Retornar verdadeiro se o usuario for admin
  isUserAdmin(): boolean {
    const isAdmin = localStorage.getItem('isAdmin');
    return isAdmin !== null && isAdmin === 'true';
  }

  /* isUserAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user !== null && user.isAdmin === true;
  } */

  //Autenticacao com Gmail
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }

  //Provedores de autenticacao
  // Provedores de autenticação
  AuthLogin(provider: any) {
    let isAdmin = false;
    return this.ngFireAuth
      .signInWithPopup(provider)
      .then((result) => {
        if (result.user) {
          this.getUserDataByUserId(result.user.uid).subscribe((userData) => {
            if (userData) {
              isAdmin = userData.isAdmin;
            } else {
              console.error('Dados do usuário não encontrados.');
            }
            // Chama SetUserData uma vez, após a obtenção dos dados do usuário
            this.SetUserData(result.user, isAdmin);

            // Navegação com base no isAdmin
            if (isAdmin) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          });
        } else {
          console.error('Usuário não encontrado após o login.');
        }
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  // Armazenar os dados do usuario no local storage e na base de dados
  SetUserData(user: any, isAdmin: boolean) {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      isAdmin: isAdmin,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  // Terminar sessao
  SignOut() {
    return this.ngFireAuth.signOut().then(() => {
      localStorage.removeItem('user');
      // Remove a informação isAdmin do localStorage
      localStorage.removeItem('isAdmin');
      this.router.navigate(['login']);
    });
  }
  // Actualizar o perfil do usuário
  updateUserProfile(displayName: string, photoURL: string): Promise<void> {
    return (
      this.ngFireAuth.currentUser
        /* .then((user) => {
        if (user) {
          // Actualizar o perfil do usuário com os novos dados
          return user.updateProfile({
            displayName,
            photoURL,
          });
        }
      }) */
        .then(() => {
          // Actualizar os dados no Firestore
          return this.updateUserData({ displayName, photoURL });
        })
        .catch((error) => {
          // Lidar com erros durante a actualização do perfil
          console.error(error);
          throw error;
        })
    );
  }

  // Método para obter dados do usuário pelo ID
  getUserDataByUserId(userId: string): Observable<User | undefined> {
    const userRef: AngularFirestoreDocument<User> = this.afStore.doc(
      `users/${userId}`
    );
    return userRef.valueChanges();
  }

  // Método para actualizar os dados do usuário no Firestore
  updateUserData(userData: any): Promise<void> {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(
      `users/${this.userData.uid}`
    );

    return userRef.set(userData, { merge: true });
  }
}
