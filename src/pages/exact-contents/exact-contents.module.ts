import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExactContentsPage } from './exact-contents';

@NgModule({
  declarations: [
    ExactContentsPage,
  ],
  imports: [
    IonicPageModule.forChild(ExactContentsPage),
  ],
})
export class ExactContentsPageModule {}
