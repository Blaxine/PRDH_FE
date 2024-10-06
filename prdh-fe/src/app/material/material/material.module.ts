import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  /** 
   * material module only shares modules that will be shared across the module
   * modules that are only used in ONE component and no ther should be 
   * inported on their ownmodule for efficiency of lazy loading
   */
  imports: [
    MatFormFieldModule,
    MatButtonModule
  ],
  exports: [
    MatFormFieldModule,
    MatButtonModule
  ]
})
export class MaterialModule { }
