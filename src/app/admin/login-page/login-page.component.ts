import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../../shared/interfaces/user";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  //@ts-ignore
  form: FormGroup

  constructor() {

  }

  ngOnInit(): void {
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
    const user: User = {...this.form.value}
    console.log(user)
  }
}
