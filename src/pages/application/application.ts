import {Component} from '@angular/core';
import {MenuController, ModalController, NavController, NavParams} from 'ionic-angular';
import {ExactContentsPage} from "../exact-contents/exact-contents";
import {CrudProvider} from "../../providers/crud/crud";
import {SendContentPage} from "../send-content/send-content";
import {GlobalVars} from '../common/globalVars';
import {GlobalProvider} from "../../providers/global/global";
import {InAppBrowserOptions, InAppBrowser} from '@ionic-native/in-app-browser';
import {File} from '@ionic-native/file';
import {FileOpener} from '@ionic-native/file-opener';
import {HTTP} from '@ionic-native/http';
import {FilterPage} from "../filter/filter";
import {ContentListPage} from "../content-list/content-list";

@Component({
  selector: 'page-application',
  templateUrl: 'application.html',
})
export class ApplicationPage {

  protected contents: any;
  protected categoriesList: any;
  protected searchItem: boolean;
  protected checkPage: boolean;
  protected contentName: string;
  protected applicationId: number;
  cbChecked: string[];
  submitted = false;
  private categories: any[] = [];
  private amountChecked: number = 0;

  private browserOptions: InAppBrowserOptions = {
    location: 'no',//Or 'no'
    hidden: 'no', //Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'no',//Android only ,shows browser zoom controls
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', //Android only
    closebuttoncaption: 'Close', //iOS only
    disallowoverscroll: 'no', //iOS only
    toolbar: 'yes', //iOS only
    enableViewportScale: 'no', //iOS only
    allowInlineMediaPlayback: 'no',//iOS only
    presentationstyle: 'pagesheet',//iOS only
    fullscreen: 'yes',//Windows only
  };

  showLoader: boolean = true;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              protected crudProvider: CrudProvider,
              private globalService: GlobalProvider,
              private modalCtrl: ModalController,
              private iab: InAppBrowser,
              private file: File,
              private fileOpener: FileOpener,
              private http: HTTP,
              protected menuCtrl: MenuController) {
    this.checkPage = false;
    this.contentName = this.navParams.get('content_name');
    this.applicationId = this.navParams.get('application_id');
    this.crudProvider.getIndex('contents?application_id=' + this.navParams.get('application_id') + "&", GlobalVars.profile.token)
      .subscribe(data => {
        this.showLoader = false;

        this.categoriesList = data['categories'];
        this.contents = data['contents'];
        if (data['categories'].length) {
          this.categories = data['categories'];
          this.categories.push({name: 'Other', contents: [], id: 'nocat'});
          this.addCategories(data['contents']).then(data => {
            this.watchCats("");
          });
          this.categories.splice(-1,1);
        } else {
          this.categories = [{name: 'Contents', contents: data['contents'], id: 'nocat'}];
        }
      });
    if (this.navParams.get('checkPage')) {
      this.checkPage = this.navParams.get('checkPage');
    }
    this.cbChecked = [];
  }

  /**
   * addCategories method
   * @param contents
   * @returns {Promise<T>}
   */
  addCategories(contents) {
    return new Promise((resolve, reject) => {
      if (contents && contents.length < 500) {
        this.addContents(contents, resolve, false);
      } else if (contents.length > 500) {
        this.addContents(contents, resolve, true, 0);
      } else reject('No categories found.')
    })
  }

  /**
   * watchCats method
   * @param search
   */
  watchCats(search) {
    this.categories.forEach(cat => {
      if (cat['contents'] && cat['contents'].length) {
        let hasItems = false;
        cat['contents'].forEach(item => {
          let found = false;
          if (item.first_name && item.first_name.toLowerCase().indexOf(search.toLowerCase()) !== -1) found = true;
          if (item.last_name && item.last_name.toLowerCase().indexOf(search.toLowerCase()) !== -1) found = true;
          if (item.email && item.email.toLowerCase().indexOf(search.toLowerCase()) !== -1) found = true;
          if (item.name && item.name.toLowerCase().indexOf(search.toLowerCase()) !== -1) found = true;
          if (item.title && item.title.toLowerCase().indexOf(search.toLowerCase()) !== -1) found = true;
          if (found) hasItems = true;
          item['show'] = found;
        });
        if (hasItems) cat['show'] = true;
        else cat['show'] = false;
      }
    })
  }

  /**
   * watchCats method
   * @param search
   */
  watchCatsSearch(search) {
    this.crudProvider.getIndex('contents?application_id=' + this.navParams.get('application_id') + "&search_data=" + search + "&", GlobalVars.profile.token)
      .subscribe(data => {
        this.contents = data['contents'];
        if (data['categories'].length) {
          this.categories = data['categories'];
          this.categories.push({name: 'Other', contents: [], id: 'nocat'});
          this.addCategories(data['contents']).then(data => {
            this.watchCats("");
          })
        } else {
          this.categories = [{name: 'Contents', contents: data['contents'], id: 'nocat'}];
        }
      });
    this.cbChecked = [];
  }

  watchCatsSearch2(search){
    this.searchItem = true
    this.watchCats(search)
  }

  /**
   * isAllChecked method
   * @param category
   * @returns {boolean}
   */
  isAllChecked(category) {
    let checked = 0;
    category['contents'].forEach((item, index) => {
      if (item['checked']) checked++
    });
    if (checked >= category['contents'].length) return true;
    else return false;
  }

  /**
   * checkAll method
   * @param category
   */
  checkAll(category) {
    if (!this.isAllChecked(category)) {
      category['contents'].forEach((item, index) => {
        if (!item['checked']) {
          item['checked'] = true;
          this.checkContent(item)
        }
      })
    } else {
      category['contents'].forEach((item, index) => {
        if (item['checked']) {
          item['checked'] = false;
          this.checkContent(item)
        }
      })
    }
  }

  /**
   * checkContent method
   * @param content
   * @param cat
   */
  checkContent(content, cat = false) {
    if (content['checked']) {
      this.amountChecked++;
      this.globalService.addContent(content);
    }
    else {
      this.amountChecked--;
      this.globalService.removeContent(content['id']);
    }

    if (cat) {
      cat['checked'] = this.isAllChecked(cat);
    }
  }

  /**
   * @return void
   */
  protected sendContents() {
    let contentsToSend = [];
    let temp = this.globalService.getContents();
    temp.forEach(content => {
      contentsToSend.push(content['id'])
    });
    let modal = this.modalCtrl.create(SendContentPage, {
      application_id: this.navParams.get('application_id'),
      check: contentsToSend
    });

    modal.present();
    modal.onWillDismiss(data => {
      this.categories.forEach(cat => {
        cat['checked'] = false;
      });
      this.contents.forEach(content => {
        content['checked'] = false;

      });
      this.amountChecked = 0;
    })
  }

  /**
   * checkContent method
   * @param contents
   * @param resolve
   * @param recursive
   * @param gi
   */
  addContents(contents, resolve, recursive, gi = 0) {
    if (!recursive)
      contents.forEach((content, index) => {
        if (content['category'] && content['category'].length) {
          content['category'].forEach(category => {
            content['checked'] = false;
            this.categories.forEach(cat => {
              if (cat['id'] == category)
                if (!cat['contents']) cat['contents'] = [content];
                else cat['contents'].push(content);
            })
          })
        } else {
          content['checked'] = false;
          this.categories.forEach(cat => {
            if (cat['id'] == 'nocat')
              if (!cat['contents']) cat['contents'] = [content];
              else cat['contents'].push(content);
          })
        }
        if (index == contents.length - 1) {
          resolve();
        }
      });
    else
      contents.forEach((content, index) => {
        if (index > gi && index <= gi + 50)
          if (content['category'] && content['category'].length) {
            content['category'].forEach(category => {
              content['checked'] = false;
              this.categories.forEach(cat => {
                if (cat['id'] == category)
                  if (!cat['contents']) cat['contents'] = [content];
                  else cat['contents'].push(content);
              })
            })
          } else {
            content['checked'] = false;
            this.categories.forEach(cat => {
              if (cat['id'] == 'nocat')
                if (!cat['contents']) cat['contents'] = [content];
                else cat['contents'].push(content);
            })
          }
        if (index == contents.length - 1) {
          resolve();
        }
        if (index == gi + 50) setTimeout(() => {
          // alert('recursive HIT');
          this.addContents(contents, resolve, true, index)
        }, 200);
      })
  }

  /**
   * goToExactContent method
   * @param content_id
   */
  protected goToExactContent(content_id) {
    this.crudProvider.getIndex('contents/' + content_id + "?", GlobalVars.profile.token)
      .subscribe(data => {
        let name = data.content.name.replace(/\s+/g, '-') + '.pdf';
        switch (data.content.file_type) {
          case 'video':
          case 'website':
          case 'vimeo':
          case 'youtube':
            this.openUrl(data.content.file_path[0]);
            break;
          case 'pdf':
            this.downloadPdf(data.content.url, name);
            break;
          default:
            this.navCtrl.push(ExactContentsPage, {
              data: data.content.file_path
            });
            break;
        }
      });
  }

  /**
   * @param data
   * @param name
   */
  public downloadPdf(data, name) {
    this.globalService.getLoad(true);
    this.http.downloadFile(data, {}, {}, this.file.dataDirectory + name)
      .then((data) => {
        this.showDownload(this.file.dataDirectory + name);
        this.globalService.getLoad(false);
      })
      .catch(error => {
        this.globalService.getLoad(false);
      });
  }

  /**
   * @param data
   * @return void
   */
  public showDownload(data) {
    this.fileOpener.open(data, 'application/pdf')
      .then(() => {
      })
      .catch(e => alert(JSON.stringify(e)));
  }

  /**
   * @param url
   * @return void
   */
  openUrl(url) {
    this.iab.create(url, "_blank", this.browserOptions);
  }

  /**
   * @return void
   */
  protected filter() {
    const myData = {
      applicationId: this.applicationId,
      contentName: this.contentName,
      categoriesList: this.categoriesList
    };

    let profileModal = this.modalCtrl.create(
      FilterPage, {data: myData}, {
        enableBackdropDismiss: false
      });
    profileModal.present();
  }

  /**
   * @return void
   */
  protected goBackContent() {
    this.menuCtrl.enable(false, "hamburger-menu");
    this.navCtrl.setRoot(ContentListPage);
  }
}