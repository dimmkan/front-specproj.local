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
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DoctorTable, FilialTable} from "../../shared/interfaces";
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
  selectedFile: File = null;


  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private modalService: NgbModal,
  ) {
    this.reloadDoctors()
    this.loadFilials()
  }

  ngOnInit(): void {
    this.doctorForm = new FormGroup({
      id: new FormControl(null, Validators.required),
      lastName: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      middleName: new FormControl(''),
      specification: new FormControl('', Validators.required),
      filialID: new FormControl('', Validators.required),
    })
    this.filialForm = new FormGroup({
      filial_id: new FormControl(null, Validators.required),
      filial_description: new FormControl('', Validators.required),
      filial_address: new FormControl('', Validators.required),
      filial_city: new FormControl('', Validators.required),
    })
    this.doctorAddForm = new FormGroup({
      add_lastName: new FormControl('', Validators.required),
      add_firstName: new FormControl('', Validators.required),
      add_middleName: new FormControl('', Validators.required),
      add_specification: new FormControl('', Validators.required),
      add_filialID: new FormControl(null, Validators.required),
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

  private loadFilials() {
    this.http.get<FilialTable[]>('http://back-specporj.local:8000/api/filial', {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(response => {
        //@ts-ignore
        this.filials = response.filials
      })
  }

  openAdd(addM: TemplateRef<any>) {
    this.modalService.open(addM, {ariaLabelledBy: 'modal-basic-title', size: 'lg'})
  }

  openDoctor(id: number, doctorM: TemplateRef<any>) {
    this.http.get<FilialTable>(`http://back-specporj.local:8000/api/doctor/${id}`, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(response => {
        //@ts-ignore
        this.openedDoctor = response.doctor
        this.modalService.open(doctorM, {ariaLabelledBy: 'modal-basic-title', size: 'lg'})
      })
  }

  submitDoctorModal() {
    const formData = <DoctorTable>{...this.doctorForm.value}
    this.http.put(`http://back-specporj.local:8000/api/doctor/${formData.id}`, formData, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(() => {
        this.reloadDoctors()
        this.doctorForm.reset()
      })
  }

  openDeleteModal(deleteWindow: TemplateRef<any>) {
    this.modalService.open(deleteWindow, {ariaLabelledBy: 'modal-basic-title', size: 'lg'})
  }

  addDoctorModal() {
    const formData = {...this.doctorAddForm.value}
    this.http.post(`http://back-specporj.local:8000/api/doctor`, {
      firstName: formData.add_firstName,
      middleName: formData.add_middleName,
      lastName: formData.add_lastName,
      specification: formData.add_specification,
      filialID: formData.add_filialID,
    },{headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(() => {
        this.reloadDoctors()
        this.doctorAddForm.reset()
      })
  }

  deleteDoctor(id: number) {
    this.http.delete(`http://back-specporj.local:8000/api/doctor/${id}`, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(() => {
        this.reloadDoctors()
        this.doctorForm.reset()
      })
  }

  openFilial(filialID: number, filialM: TemplateRef<any>) {
    this.http.get<FilialTable>(`http://back-specporj.local:8000/api/filial/${filialID}`, {headers: {'Authorization': 'Bearer ' + this.auth.token}})
      .subscribe(response => {
        //@ts-ignore
        this.openedFilial = response.filial
        this.modalService.open(filialM, {ariaLabelledBy: 'modal-basic-title', size: 'lg'})
      })
  }

  uploadImage(id: number) {
    const fd = new FormData();

    fd.append('image', this.selectedFile, this.selectedFile.name);

    this.http.post(`http://back-specporj.local:8000/api/doctor/${id}/uploadImage`, fd, {
      headers: {
        'Authorization': 'Bearer ' + this.auth.token,
      }
    })
      .subscribe(res => {
        //@ts-ignore
        this.openedDoctor.imageURI = res.filepath
      });
  }

  onFileSelected($event: any) {
    this.selectedFile = <File>$event.target.files[0];
  }
}
