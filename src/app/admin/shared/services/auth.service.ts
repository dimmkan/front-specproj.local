import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {User} from "../../../shared/interfaces/user";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {AuthResponse} from "../../../shared/interfaces/authResponse";

@Injectable()
export class AuthService {
  get token(): string{
    if(!localStorage.getItem('bearer-token')) return null
    const expDate =  new Date(JSON.parse(atob(localStorage.getItem('bearer-token').split('.')[1])).exp.toString())
    if (new Date() > expDate){
      this.logout()
      return null
    }
    console.log(3)
    return localStorage.getItem('bearer-token')
  }
  constructor(private http: HttpClient) {}

  login(user: User): Observable<any> {
    return this.http.post('http://back-specporj.local:8000/api/auth/login', user)
      .pipe(
        // @ts-ignore
        tap(this.setToken)
      )
  }

  logout(){
    this.setToken(null)
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  //@ts-ignore
  private setToken(response: AuthResponse | null) {
    if(response){
      const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000)
      localStorage.setItem('bearer-token', response.token)
      localStorage.setItem('bearer-token-expires', expDate.toString())
    }else{
      localStorage.clear()
    }
  }

}
