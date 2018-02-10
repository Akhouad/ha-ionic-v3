import { Component } from '@angular/core';
import {MenuController, NavController, NavParams} from "ionic-angular";
import {CrudProvider} from "../../providers/crud/crud";
import {AuthProvider} from "../../providers/auth/auth";
import {GlobalVars} from '../common/globalVars';
import {InAppBrowserOptions, InAppBrowser} from "@ionic-native/in-app-browser";

import {ContentListPage} from "../content-list/content-list";
import {LeaderBoardPage} from "../leader-board/leader-board";
import {SpeakersListPage} from "../speakers-list/speakers-list";
import {ExhibitorListPage} from "../exhibitor-list/exhibitor-list";
import {SponsorsPage} from "../sponsors/sponsors";
import {SurvaysPage} from "../survays/survays";
import {MapListPage} from "../map-list/map-list";
import {GamesPage} from "../games/games";
import {AgendaPage} from "../agenda/agenda";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  protected icons: any;
  protected userType: string;
  protected pastEvents: any;
  protected currentEvents: any;
  protected futureEvents: any;
  protected company: any;
  protected company_id: number;
  protected event_id: number;
  protected event_type: boolean;
  protected emptyPast: boolean;
  protected empty: boolean;
  protected emptyAll: boolean;

  showLoader: boolean = true;
  
  options : InAppBrowserOptions = {
    location : 'no',//Or 'no'
    hidden : 'no', //Or  'yes'
    clearcache : 'yes',
    clearsessioncache : 'yes',
    zoom : 'no',//Android only ,shows browser zoom controls
    hardwareback : 'yes',
    mediaPlaybackRequiresUserAction : 'no',
    shouldPauseOnSuspend : 'no', //Android only
    closebuttoncaption : 'Close', //iOS only
    disallowoverscroll : 'no', //iOS only
    toolbar : 'yes', //iOS only
    enableViewportScale : 'no', //iOS only
    allowInlineMediaPlayback : 'no',//iOS only
    presentationstyle : 'pagesheet',//iOS only
    fullscreen : 'yes',//Windows only
  };

  constructor(
    public crudProvider: CrudProvider,
    public auth: AuthProvider,
    public navCtrl: NavController,
    protected navParams: NavParams,
    public menu: MenuController,
    private iab: InAppBrowser
  ) {

    this.icons = 'current';
    this.userType = GlobalVars.profile.userType;
    this.company_id = GlobalVars.company_id;
    this.event_id = GlobalVars.event_id;
    this.event_type = GlobalVars.event_type;

    this.crudProvider.getIndex('events?company_id=' + this.company_id + '&', GlobalVars.profile.token)
      .subscribe(data => {
        this.showLoader = false;
        this.pastEvents = data.pastEvents;
        if (this.pastEvents.length < 1) {
          this.emptyPast = true;
        }
        this.currentEvents = data.currentEvents;
        this.futureEvents = data.futureEvents;
        if (this.currentEvents.length + this.futureEvents.length < 1) {
          this.empty = true;
        }
        if (this.currentEvents.length + this.futureEvents.length + this.pastEvents.length < 1) {
          this.emptyAll = true;
        }
        else this.emptyAll = false;
      });

    this.company = GlobalVars.companies;

  }
  
  /**
   * go to one exact event show event sessions too
   * @param id
   * @param type
   * @param applications
   * @param hasSessions
   * @param root
   * @return void
   */
  public goExactEvent(id, type, applications, hasSessions, root) {
    GlobalVars.event_id = id;
    GlobalVars.checkItem = true;
    GlobalVars.event_type = type;
    if(type){
      GlobalVars.rootPageTitle = 'Content';
      GlobalVars.rootPage = 'content';
      GlobalVars.rootPageIcon = 'book';
      this.navCtrl.setRoot(ContentListPage, {
        id: id
      })
    } else {
      switch (root){
        case 'agenda':
          GlobalVars.rootPageTitle = 'Agenda';
          GlobalVars.rootPage = 'agenda';
          GlobalVars.rootPageIcon = 'list-box';
          this.navCtrl.setRoot(AgendaPage);
          break;
        case 'leader_board':
          GlobalVars.rootPageTitle = 'Leader board';
          GlobalVars.rootPage = 'leader_board';
          GlobalVars.rootPageIcon = 'thumbs-up';
          this.navCtrl.setRoot(LeaderBoardPage);
          break;
        case 'speakers':
          GlobalVars.rootPageTitle = 'Speakers';
          GlobalVars.rootPage = 'speakers';
          GlobalVars.rootPageIcon = 'happy';
          this.navCtrl.setRoot(SpeakersListPage);
          break;
        case 'exhibitors':
          GlobalVars.rootPageTitle = 'Exhibitors';
          GlobalVars.rootPage = 'exhibitors';
          GlobalVars.rootPageIcon = 'body';
          this.navCtrl.setRoot(ExhibitorListPage);
          break;
        case 'sponsors':
          GlobalVars.rootPageTitle = 'Sponsors';
          GlobalVars.rootPage = 'sponsors';
          GlobalVars.rootPageIcon = 'contacts';
          this.navCtrl.setRoot(SponsorsPage);
          break;
        case 'content':
          GlobalVars.rootPageTitle = 'Content';
          GlobalVars.rootPage = 'content';
          GlobalVars.rootPageIcon = 'book';
          this.navCtrl.setRoot(ContentListPage);
          break;
        case 'surveys':
          GlobalVars.rootPageTitle = 'Surveys';
          GlobalVars.rootPage = 'surveys';
          GlobalVars.rootPageIcon = 'stats';
          this.navCtrl.setRoot(SurvaysPage);
          break;
        case 'maps':
          GlobalVars.rootPageTitle = 'Maps';
          GlobalVars.rootPage = 'maps';
          GlobalVars.rootPageIcon = 'map';
          this.navCtrl.setRoot(MapListPage);
          break;
        case 'games':
          GlobalVars.rootPageTitle = 'Games';
          GlobalVars.rootPage = 'games';
          GlobalVars.rootPageIcon = 'game-controller-a';
          this.navCtrl.setRoot(GamesPage);
          break;
      }
    }
  }

}
