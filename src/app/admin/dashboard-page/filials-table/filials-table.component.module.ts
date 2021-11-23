import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilialsTableComponent } from './filials-table.component';



@NgModule({
  declarations: [
    FilialsTableComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FilialsTableComponent
  ],
  bootstrap: [
    FilialsTableComponent
  ]
})
export class FilialsTableComponentModule { }
