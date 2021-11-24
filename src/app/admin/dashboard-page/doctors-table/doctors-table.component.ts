import {
  Component,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {DoctorTable, FilialTable} from "../../shared/interfaces";
import {FilialsTableSortableHeader} from "../filials-table/filials-table.component";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../shared/services/auth.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

export type SortColumn = keyof DoctorTable | '';
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
export class DoctorsTableSortableHeader {
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort: EventEmitter<SortEvent> = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}

@Component({
  selector: 'app-doctors-table',
  templateUrl: './doctors-table.component.html',
  styleUrls: ['./doctors-table.component.scss']
})
export class DoctorsTableComponent implements OnInit {
  @ViewChildren(DoctorsTableSortableHeader) headers: QueryList<DoctorsTableSortableHeader>;
  collectionSize: number;
  page: number = 1;
  pageSize: number = 5;
  doctors: DoctorTable[] = []
  refresh: DoctorTable[] = [];
  doctorForm: FormGroup;
  openedDoctor: DoctorTable;
  doctorAddForm: FormGroup;
  filialForm: FormGroup;
  openedFilial: FilialTable;
  filials: FilialTable[] = [];


  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private modalService: NgbModal,
  ) {
    this.reloadDoctors()
  }

  ngOnInit(): void {
    this.doctorAddForm = new FormGroup({

    })
  }

  onSort({column, direction}: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    if (direction === '' || column === '') {
      this.refreshDoctors()
    } else {
      this.refresh = [...this.refresh].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  private reloadDoctors() {
    this.http.get<DoctorTable[]>('http://back-specporj.local:8000/api/doctor', {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(response => {
        //@ts-ignore
        this.doctors = response.doctors
        this.collectionSize = this.doctors.length
        this.refresh = [...this.doctors].slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)
      })
  }

  refreshDoctors() {
    this.refresh = [...this.doctors].slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)
  }

  openAdd(addM: TemplateRef<any>) {

  }

  openDoctor(id: number, doctorM: TemplateRef<any>) {

  }

  submitDoctorModal() {

  }

  openDeleteModal(deleteWindow: TemplateRef<any>) {

  }

  addDoctorModal() {

  }

  deleteDoctor(id: number) {

  }

  openFilial(filialID: number, filialM: TemplateRef<any>) {
    this.http.get<FilialTable>(`http://back-specporj.local:8000/api/filial/${filialID}`, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(response => {
        //@ts-ignore
        this.openedFilial = response.filial
        this.modalService.open(filialM, {ariaLabelledBy: 'modal-basic-title', size: 'lg'})
      })
  }
}
