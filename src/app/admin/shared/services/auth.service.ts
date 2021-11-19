import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {User} from "../../../shared/interfaces/user";
import {Observable, Subject, throwError} from "rxjs";
import {catchError, tap} from "rxjs/operators";
import {AuthResponse} from "../../../shared/interfaces/authResponse";
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable()
export class AuthService {

  public error$: Subject<string> = new Subject<string>()

  get token(): string {
    const helper = new JwtHelperService();
    if (helper.isTokenExpired(localStorage.getItem('access_token'))) {
      this.logout()
      return null
    }
    return localStorage.getItem('access_token')
  }


  constructor(private http: HttpClient) {
  }

  login(user: User): Observable<any> {

    return this.http.post('http://back-specporj.local:8000/api/auth/login', user)
      .pipe(
        // @ts-ignore
        tap(this.setToken),
        // @ts-ignore
        catchError(this.handleError.bind(this))
      )
  }

  logout() {
    this.setToken(null)
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  private handleError(error: HttpErrorResponse) {
    const {message} = error.error
    switch (message) {
      case 'Email error':
        this.error$.next('Неверный e-mail')
        break
      case 'Password error':
        this.error$.next('Неверный пароль')
        break
      case 'Login error':
        this.error$.next('Ошибка аутентификации')
        break
    }
    return throwError(error)
  }

  //@ts-ignore
  private setToken(response: AuthResponse | null) {
    if (response) {
      localStorage.setItem('access_token', response.token)
    } else {
      localStorage.clear()
    }
  }

}
