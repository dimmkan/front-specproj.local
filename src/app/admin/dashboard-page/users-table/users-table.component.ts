import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../shared/services/auth.service";

interface UserTable {
  id: number;
  email: string;
  role: string;
  filialID?: number;
}

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss']
})
export class UsersTableComponent implements OnInit {

  users: UserTable[] = []

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
    this.http.get<UserTable[]>('http://back-specporj.local:8000/api/user', {headers: {'Authorization': 'Bearer '+this.auth.token}})
      .subscribe(response =>{
        //@ts-ignore
        this.users = response.users
      })
  }

  ngOnInit(): void {

  }

}
