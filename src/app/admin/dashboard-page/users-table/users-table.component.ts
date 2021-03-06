import {
  Component,
  Directive,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef, TemplateRef
} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../shared/services/auth.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FilialTable} from "../../shared/interfaces";

interface UserTable {
  id: number;
  email: string;
  password: string;
  role: string;
  filialID?: number;
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

  userForm: FormGroup
  filialForm: FormGroup
  newUserForm: FormGroup

  users: UserTable[] = []
  refresh: UserTable[] = []
  openedUser: UserTable
  filials: FilialTable[] = []
  openedFilial: FilialTable

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
    this.filialForm = new FormGroup({
      filial_id: new FormControl(null),
      filial_description: new FormControl(''),
      filial_address: new FormControl(''),
      filial_city: new FormControl(''),
    })

    this.newUserForm = new FormGroup({
      n_email: new FormControl('', [Validators.required, Validators.email]),
      n_password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      n_role: new FormControl(null, Validators.required),
      n_filialID: new FormControl(null),
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
    // ???????? ???????????????? ???????????? ???????????????????????? - ???????????????????????????? ???????????? ???????????????????????? ????????????????????
    if(formData.password !== '') {
      this.http.put(`http://back-specporj.local:8000/api/user/${formData.id}`, formData, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
        .subscribe(() => {
          this.reloadUsers()
          this.userForm.reset()
        })
    // ???????? ???????????? ???? ?????????????? - ???????????????? ?????????????????? ???????????????? ?????????? ?? ???????? ?????? ???? ???????????????????? - ???? ?????????? ????????????????????????????
    }else if (formData.email !== this.openedUser.email || formData.role !== this.openedUser.role || formData.filialID !== this.openedUser.filialID) {
      delete formData.password
      this.http.put(`http://back-specporj.local:8000/api/user/${formData.id}`, formData, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
        .subscribe(() => {
          this.reloadUsers()
          this.userForm.reset()
        })
    }
  }

  openFilial(filialID: any, filialM: TemplateRef<any>) {
    this.http.get<FilialTable>(`http://back-specporj.local:8000/api/filial/${filialID}`, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(response => {
        //@ts-ignore
        this.openedFilial = response.filial
        this.modalService.open(filialM, {ariaLabelledBy: 'modal-basic-title', size: 'lg'})
      })
  }

  addUserModal() {
    const formData = {...this.newUserForm.value}
    this.http.post(`http://back-specporj.local:8000/api/user`, {
      email: formData.n_email,
      password: formData.n_password,
      role: formData.n_role,
      filialID: formData.n_filialID,
    },{headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(() => {
        this.reloadUsers()
        this.newUserForm.reset()
      })
  }

  openAdd(userAdd: TemplateRef<any>) {
    this.modalService.open(userAdd, {ariaLabelledBy: 'modal-basic-title', size: 'lg'})
  }

  openDeleteModal(deleteWindow: TemplateRef<any>) {
    this.modalService.open(deleteWindow, {ariaLabelledBy: 'modal-basic-title', size: 'lg'})
  }

  deleteUser(id: number) {
    this.http.delete(`http://back-specporj.local:8000/api/user/${id}`, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(() => {
        this.reloadUsers()
        this.userForm.reset()
      })
  }
}
