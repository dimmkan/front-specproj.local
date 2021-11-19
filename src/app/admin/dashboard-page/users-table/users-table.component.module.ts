import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { UsersTableComponent } from './users-table.component'

@NgModule({
  imports: [CommonModule, NgbModule],
  declarations: [UsersTableComponent],
  exports: [UsersTableComponent],
  bootstrap: [UsersTableComponent]
})
export class UsersTableModule {}
