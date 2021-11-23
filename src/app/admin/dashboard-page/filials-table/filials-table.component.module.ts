import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FilialsTableComponent, FilialsTableSortableHeader} from './filials-table.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";



@NgModule({
  declarations: [
    FilialsTableComponent,
    FilialsTableSortableHeader,
  ],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    FilialsTableComponent
  ],
  bootstrap: [
    FilialsTableComponent
  ]
})
export class FilialsTableComponentModule { }
