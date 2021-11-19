import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {UsersTableComponent, UserTableSortableHeader} from './users-table.component'

@NgModule({
  imports: [CommonModule, NgbModule],
  declarations: [UsersTableComponent, UserTableSortableHeader],
  exports: [UsersTableComponent],
  bootstrap: [UsersTableComponent]
})
export class UsersTableModule {}
