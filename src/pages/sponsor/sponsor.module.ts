import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SponsorPage } from './sponsor';

@NgModule({
  declarations: [
    SponsorPage,
  ],
  imports: [
    IonicPageModule.forChild(SponsorPage),
  ],
})
export class SponsorPageModule {}
