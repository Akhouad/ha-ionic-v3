import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExactCategoriesPage } from './exact-categories';

@NgModule({
  declarations: [
    ExactCategoriesPage,
  ],
  imports: [
    IonicPageModule.forChild(ExactCategoriesPage),
  ],
})
export class ExactCategoriesPageModule {}
