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
import {FilialTable} from "../../shared/interfaces";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../shared/services/auth.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

export type SortColumn = keyof FilialTable | '';
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
export class FilialsTableSortableHeader {
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort: EventEmitter<SortEvent> = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}


@Component({
  selector: 'app-filials-table',
  templateUrl: './filials-table.component.html',
  styleUrls: ['./filials-table.component.scss']
})
export class FilialsTableComponent implements OnInit {
  @ViewChildren(FilialsTableSortableHeader) headers: QueryList<FilialsTableSortableHeader>;
  collectionSize: number;
  page: number = 1;
  pageSize: number = 5;
  filials: FilialTable[] = []
  refresh: FilialTable[] = [];
  filialForm: FormGroup;
  openedFilial: FilialTable;
  filialAddForm: FormGroup;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private modalService: NgbModal,
  ) {
    this.reloadFilials()
  }

  ngOnInit(): void {
    this.filialForm = new FormGroup({
      id: new FormControl(null),
      description: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
    })

    this.filialAddForm = new FormGroup({
      add_description: new FormControl('', Validators.required),
      add_address: new FormControl('', Validators.required),
      add_city: new FormControl('', Validators.required),
    })
  }

  onSort({column, direction}: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    if (direction === '' || column === '') {
      this.refreshFilials()
    } else {
      this.refresh = [...this.refresh].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  private reloadFilials() {
    this.http.get<FilialTable[]>('http://back-specporj.local:8000/api/filial', {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(response => {
        //@ts-ignore
        this.filials = response.filials
        this.collectionSize = this.filials.length
        this.refresh = [...this.filials].slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)
      })
  }

  refreshFilials() {
    this.refresh = [...this.filials].slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)
  }

  openFilial(id: number, filialM: TemplateRef<any>) {
    this.http.get<FilialTable>(`http://back-specporj.local:8000/api/filial/${id}`, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(response => {
        //@ts-ignore
        this.openedFilial = response.filial
        this.modalService.open(filialM, {ariaLabelledBy: 'modal-basic-title', size: 'lg'})
      })
  }

  openAdd(addM: TemplateRef<any>) {
    this.modalService.open(addM, {ariaLabelledBy: 'modal-basic-title', size: 'lg'})
  }

  submitFilialModal() {
    const formData = <FilialTable>{...this.filialForm.value}
    this.http.put(`http://back-specporj.local:8000/api/filial/${formData.id}`, formData, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(() => {
        this.reloadFilials()
        this.filialForm.reset()
      })
  }

  addFilialModal() {
    const formData = {...this.filialAddForm.value}
    this.http.post(`http://back-specporj.local:8000/api/filial`, {
      description: formData.add_description,
      address: formData.add_address,
      city: formData.add_city,
    },{headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(() => {
        this.reloadFilials()
        this.filialAddForm.reset()
      })
  }

  openDeleteModal(deleteWindow: TemplateRef<any>) {
    this.modalService.open(deleteWindow, {size: 'lg'})
  }

  deleteFilial(id: number) {
    this.http.delete(`http://back-specporj.local:8000/api/filial/${id}`, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(() => {
        this.reloadFilials()
        this.filialForm.reset()
      })
  }
}
