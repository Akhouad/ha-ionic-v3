import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { GlobalProvider } from "../../providers/global/global";
import { AuthProvider } from "../../providers/auth/auth";
import { GlobalVars } from '../common/globalVars';
import { Intercom } from '@ionic-native/intercom';
import { Storage } from '@ionic/storage';
import { Keyboard } from '@ionic-native/keyboard';

import { CompaniesPage } from '../companies/companies';
import {ForgotPasswordPage} from "../forgot-password/forgot-password";
import {SignupPage} from "../signup/signup";

export interface AuthUser {
  email: string,
  password?: string
}

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  @ViewChild('pass') passInput;

  button: boolean = false;
  private data: AuthUser = {
    email: "",
    password: ""
  };
  private loading: boolean = false;
  private keyboardShown:boolean;

  constructor(
    public navCtrl: NavController, private alertCtrl: AlertController,
    public authService: AuthProvider,
    private storage: Storage,
    private keyboard:Keyboard,
    public navParams: NavParams,
    protected globalService: GlobalProvider,
    private intercom: Intercom
  ) {
    this.keyboardShown = false;
  }

  ionViewDidLoad() {
    this.keyboard.onKeyboardShow().subscribe(()=>{
      this.keyboardShown = true;

    });
    this.keyboard.onKeyboardHide().subscribe(()=>{
      this.keyboardShown = false;

    });
  }
  
  /**
   * input method
   * @param code
   * @param $event
   */
  private input(code, $event) {
    if (this.validateEmail() && this.data.password.length > 0)
      this.triggerButton(true);
    else this.triggerButton(false);
  }
  
  /**
   * triggerButton method
   * @param _switch
   */
  private triggerButton(_switch: boolean) {
    this.button = _switch;
  }
  
  /**
   * email validation method
   * @returns {boolean}
   */
  private validateEmail() {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(this.data.email);
  }

  /**
   * go to second method
   * @param val
   * @param key
   */
  goSecond(val, key) {
    if (this.validateEmail() && key == 'Enter')
      this.passInput.setFocus();
  }
  
  /**
   * @param val
   * @param key
   */
  enterSubmit(val, key) {
    if (val.length > 0 && this.button && key == 'Enter' && !this.loading)
      //console.log('done');
      this.submit();
  }


  /**
   * submit method
   * @param $event
   */
  submit($event: any = false) {
    this.loading = true;
    this.globalService.blindPreloader.emit(true);
    this.authService.login(this.data.email, this.data.password).subscribe(res => {
      if (res['token']) {
        GlobalVars.profile ={
          token: res['token'],
          userType: res['usertype'],
          email:this.data.email
        };
        this.intercom.registerIdentifiedUser({ email: this.data.email });
        this.intercom.setLauncherVisibility('GONE');
        this.storage.set('profile', JSON.stringify(GlobalVars.profile)).then(
          ()=>{
            GlobalVars.LoginPage = false;
              this.loading = false;
              this.navCtrl.setRoot(CompaniesPage);
          }
        ).catch(err => console.error('SQLITE CAUGHT', err));
      } else {
        this.wrongDataAlert();
        this.loading = false;
      }
    }, err => {
      if (err.status == 401) this.wrongDataAlert();
      else {
        this.errorAlert();
      }
      this.loading = false;
    })
  }
  
  /**
   * alert wrong message method
   */
  private wrongDataAlert() {
    let alert = this.alertCtrl.create({
      title: 'Wrong email or password',
      subTitle: 'Please, try again',
      buttons: ['Dismiss']
    });
    alert.present();
  }

  /**
   * alert error method
   */
  private errorAlert() {
    let alert = this.alertCtrl.create({
      title: 'Server error, please check your connection and try again.',
      subTitle: 'Please, try again later.',
      buttons: ['Dismiss']
    });
    alert.present();
  }
  
  /**
   * forgot password method
   * @param $event
   */
  private forgotPassword($event) {
    $event.preventDefault();
    this.navCtrl.push(ForgotPasswordPage);
  }

  /**
   * go to sign-up page
   */
  protected signUp() {
    this.navCtrl.push(SignupPage);
  }

}
