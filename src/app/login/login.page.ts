import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../shared/authentication-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(
    public authService: AuthenticationService,
    public router: Router
  ) {}

  ngOnInit() {}

  logIn(email: any, password: any) {
    this.authService
      .SignIn(email.value, password.value)
      .then((): any => {
        if (this.authService.isEmailVerified) {
          if (this.authService.isUserAdmin()) {
            this.router.navigate(['dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          window.alert('Email não verificado');
          return false;
        }
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
}
