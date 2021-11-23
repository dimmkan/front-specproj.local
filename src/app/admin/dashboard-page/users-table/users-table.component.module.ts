import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {UsersTableComponent, UserTableSortableHeader} from './users-table.component'
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@NgModule({
  imports: [CommonModule, NgbModule, FormsModule, ReactiveFormsModule],
  declarations: [UsersTableComponent, UserTableSortableHeader],
  exports: [UsersTableComponent],
  bootstrap: [UsersTableComponent]
})
export class UsersTableModule {}
