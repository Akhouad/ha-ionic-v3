import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SendContentPage } from './send-content';

@NgModule({
  declarations: [
    SendContentPage,
  ],
  imports: [
    IonicPageModule.forChild(SendContentPage),
  ],
})
export class SendContentPageModule {}
