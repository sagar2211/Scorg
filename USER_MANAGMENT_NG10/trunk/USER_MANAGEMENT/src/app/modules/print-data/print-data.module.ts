import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintDataHomeComponent } from './components/print-data-home/print-data-home.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';


const printRoutes: Routes = [{
  path: '/', component: PrintDataHomeComponent
}];

@NgModule({
  declarations: [
    PrintDataHomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(printRoutes),
    SharedModule,
  ],
  exports: [PrintDataHomeComponent]
})
export class PrintDataModule { }
