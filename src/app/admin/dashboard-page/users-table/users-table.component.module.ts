import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {UsersTableComponent, UserTableSortableHeader} from './users-table.component'
import {FormsModule} from "@angular/forms";

@NgModule({
  imports: [CommonModule, NgbModule, FormsModule],
  declarations: [UsersTableComponent, UserTableSortableHeader],
  exports: [UsersTableComponent],
  bootstrap: [UsersTableComponent]
})
export class UsersTableModule {}
