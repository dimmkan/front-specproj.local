import {
  Component,
  Directive,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../shared/services/auth.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormControl, FormGroup, Validators} from "@angular/forms";

interface UserTable {
  id: number;
  email: string;
  password: string;
  role: string;
  filialID?: number;
}

interface FilialTable {
  id: number;
  description: string;
  address: string;
  city: string;
}

export type SortColumn = keyof UserTable | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = {'asc': 'desc', 'desc': '', '': 'asc'};

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
  @Output() sort: EventEmitter<SortEvent> = new EventEmitter<SortEvent>();

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

  //@ts-ignore
  userForm: FormGroup

  users: UserTable[] = []
  refresh: UserTable[] = []
  openedUser: UserTable
  filials: FilialTable[] = []

  @ViewChildren(UserTableSortableHeader) headers: QueryList<UserTableSortableHeader>;
  collectionSize: number;
  page: number = 1;
  pageSize: number = 5;



  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private modalService: NgbModal,
  ) {
    this.reloadUsers()
    this.loadFilials()
  }

  private reloadUsers() {
    this.http.get<UserTable[]>('http://back-specporj.local:8000/api/user', {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(response => {
        //@ts-ignore
        this.users = response.users
        this.collectionSize = this.users.length
        this.refresh = [...this.users].slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)
      })
  }

  private loadFilials() {
    this.http.get<FilialTable[]>('http://back-specporj.local:8000/api/filial', {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(response => {
        //@ts-ignore
        this.filials = response.filials
      })
  }

  ngOnInit(): void {
    this.userForm = new FormGroup({
      id: new FormControl(null),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl(''),
      role: new FormControl('', Validators.required),
      filialID: new FormControl(null),
    })
  }

  onSort({column, direction}: SortEvent) {

    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    if (direction === '' || column === '') {
      this.refreshUsers()
    } else {
      this.refresh = [...this.refresh].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  refreshUsers() {
    this.refresh = [...this.users].slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)
  }

  openUser(id: number, content: any) {
    this.http.get<UserTable>(`http://back-specporj.local:8000/api/user/${id}`, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(response => {
        //@ts-ignore
        this.openedUser = response.user
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', size: 'lg'})
      })

  }


  submitUserModal() {
    const formData = <UserTable>{...this.userForm.value}
    // Если меняется пароль пользователя - перезаписываем данные пользователя безусловно
    if(formData.password !== '') {
      this.http.put(`http://back-specporj.local:8000/api/user/${formData.id}`, formData, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
        .subscribe(() => {
          this.reloadUsers()
          this.userForm.reset()
        })
    // Если пароль не менялся - проверим изменения основных полей и если они не поменялись - не будем перезаписывать
    }else if (formData.email !== this.openedUser.email || formData.role !== this.openedUser.role || formData.filialID !== this.openedUser.filialID) {
      delete formData.password
      console.log('edit')
      this.http.put(`http://back-specporj.local:8000/api/user/${formData.id}`, formData, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
        .subscribe(() => {
          this.reloadUsers()
          this.userForm.reset()
        })
    }
  }
}
