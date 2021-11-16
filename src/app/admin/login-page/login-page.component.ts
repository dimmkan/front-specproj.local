import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../../shared/interfaces/user";
import {AuthService} from "../shared/services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  //@ts-ignore
  form: FormGroup
  submited: boolean = false

  constructor(
    public auth: AuthService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    if(this.auth.isAuthenticated()){
      this.router.navigate(['/admin', 'dashboard'])
      return
    }
    this.form = new FormGroup({
      //@ts-ignore
      email: new FormControl(null, [Validators.required, Validators.email]),
      //@ts-ignore
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    })
  }

  submit() {
    if(this.form.invalid) {
      return
    }
    this.submited = true
    const user: User = {...this.form.value}
    this.auth.login(user).subscribe(()=>{
      this.form.reset()
      this.router.navigate(['/admin', 'dashboard'])
      this.submited = false
    }, () => {
      this.submited = false
    })
  }
}
