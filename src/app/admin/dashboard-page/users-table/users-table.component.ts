import {Component, Directive, Input, OnInit, Output, EventEmitter, ViewChildren, QueryList} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../shared/services/auth.service";

interface UserTable {
  id: number;
  email: string;
  role: string;
  filialID?: number;
}

export type SortColumn = keyof UserTable | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: {[key: string]: SortDirection} = { 'asc': 'desc', 'desc': '', '': 'asc' };

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
export class UserTableSortableHeader {
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort:EventEmitter<SortEvent> = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss']
})

export class UsersTableComponent implements OnInit {

  users: UserTable[] = []

  @ViewChildren(UserTableSortableHeader) headers: QueryList<UserTableSortableHeader>;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
    this.reloadUsers()
  }

  private reloadUsers() {
    this.http.get<UserTable[]>('http://back-specporj.local:8000/api/user', {headers: {'Authorization': 'Bearer '+this.auth.token}})
      .subscribe(response =>{
        //@ts-ignore
        this.users = response.users
      })
  }

  ngOnInit(): void {

  }

  onSort({column, direction}: SortEvent) {

    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    if (direction === '' || column === '') {
      this.reloadUsers();
    } else {
      this.users = [...this.users].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

}
