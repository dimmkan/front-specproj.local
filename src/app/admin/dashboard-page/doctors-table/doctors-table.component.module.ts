import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DoctorsTableComponent, DoctorsTableSortableHeader} from './doctors-table.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    DoctorsTableComponent,
    DoctorsTableSortableHeader
  ],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    DoctorsTableComponent
  ],
  bootstrap: [
    DoctorsTableComponent
  ]
})
export class DoctorsTableComponentModule { }
