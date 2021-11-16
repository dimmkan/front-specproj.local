import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {User} from "../../../shared/interfaces/user";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";

@Injectable()
export class AuthService {
  get token(): string{
    return ''
  }
  constructor(private http: HttpClient) {}

  login(user: User): Observable<any> {
    return this.http.post('http://back-specporj.local:8000/api/auth/login', user)
      .pipe(
        tap(this.setToken)
      )
  }

  logout(){

  }

  isAuthenticated(): boolean {
    return !!this.token
  }
  //@ts-ignore
  private setToken(response) {
    console.log(response)
  }

}
