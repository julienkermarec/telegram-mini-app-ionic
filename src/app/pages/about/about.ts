import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ButtonType, FollowingType, TelegramWebApp } from '@m1cron-labs/ng-telegram-mini-app';
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
  styleUrls: ['./about.scss'],
})
export class AboutPage implements OnInit {
  @ViewChild('webview_data') webview_data: ElementRef<any>;
  @ViewChild('theme_data') theme_data: ElementRef<any>;
  @ViewChild('main_btn') main_btn: ElementRef<any>;
  @ViewChild('with_webview_btn') with_webview_btn: ElementRef<any>;
  @ViewChild('regular_link') regular_link: ElementRef<any>;
  @ViewChild('text_field') text_field: ElementRef<any>;
  @ViewChild('regular_field') regular_field: ElementRef<any>;
  @ViewChild('ver') ver: ElementRef<any>;
  @ViewChild('platform') platform: ElementRef<any>;
  @ViewChild('viewport_border') viewport_border: ElementRef<any>;
  @ViewChild('viewport_stable_border') viewport_stable_border: ElementRef<any>;
  @ViewChild('bg_color_sel') bg_color_sel: ElementRef<any>;
  @ViewChild('bg_color_input') bg_color_input: ElementRef<any>;
  private readonly telegram = inject(TelegramWebApp);

  MainButton: any = this.telegram.MainButton;
  initData: any = this.telegram.initData || '';
  initDataUnsafe: any = this.telegram.initDataUnsafe || {};
  BackButton: any = this.telegram.BackButton;
  SettingsButton: any = this.telegram.SettingsButton;
  biometricInited = false;
  // cloud storage
  cloudStorageKeys = {}
  cloudStorageItems = {}
  constructor() {
    console.log('AboutPage constructor');
  }


  ngOnInit() {
    this.setThemeClass();
    this.telegram.onEvent('themeChanged', this.setThemeClass);
    this.initAll();
  }

  initAll(){

    this.init(null);
    this.initMenu();
    this.initViewport();
    this.initWebData();
    this.initDemo();

  }

  openTelegramLink(url) {
    this.telegram.openLink(url);
  }
  setThemeClass() {
    document.documentElement.className = document.documentElement.className + ' ' + this.telegram.colorScheme;
  }

  initDemo() {
    /*
     * This part of code is used to initialize the demo app and set up the event handlers we need.
     */

    this.telegram.onEvent('themeChanged', function () {
      this.theme_data.nativeElement.innerHTML = JSON.stringify(this.telegram.themeParams, null, 2);
    });

    if (this.initDataUnsafe.query_id) {
      this.main_btn.nativeElement.style.display = 'block';
    }
    if (this.with_webview_btn)
      this.with_webview_btn.nativeElement.style.display = !!this.initDataUnsafe.query_id && !this.initDataUnsafe.receiver ? 'block' : 'none';

    if (this.webview_data)
      this.webview_data.nativeElement.innerHTML = JSON.stringify(this.initDataUnsafe, null, 2);

    if (this.theme_data) this.theme_data.nativeElement.innerHTML = JSON.stringify(this.telegram.themeParams, null, 2);
    if (this.regular_link) this.regular_link.nativeElement.setAttribute('href', document.getElementById('regular_link').getAttribute('href') + location.hash);
    if (this.text_field) this.text_field.nativeElement.focus();
    if (this.regular_field) this.regular_field.nativeElement.addEventListener('input', (e: any) => {
      const val = e.value.toLowerCase();
      if (val.indexOf('progress') >= 0) {
        this.telegram.MainButton.showProgress(1);
      } else {
        this.telegram.MainButton.hideProgress();
      }
    });

    if (this.ver) this.ver.nativeElement.innerHTML = this.telegram.version;
    if (this.platform) this.platform.nativeElement.innerHTML.innerHTML = this.telegram.platform;

    if (this.initDataUnsafe.receiver) {
      document.getElementById('peer_wrap').style.display = 'block';
      document.getElementById('peer_name').innerHTML = this.initDataUnsafe.receiver.first_name + ' ' + this.initDataUnsafe.receiver.last_name;
      if (this.initDataUnsafe.receiver.photo_url) {
        document.getElementById('peer_photo').setAttribute('src', this.initDataUnsafe.receiver.photo_url);
      } else {
        document.getElementById('peer_photo').style.display = 'none';
      }
    } else if (this.initDataUnsafe.chat) {
      document.getElementById('peer_wrap').style.display = 'block';
      document.getElementById('peer_name').innerHTML = this.initDataUnsafe.chat.title;
      if (this.initDataUnsafe.chat.photo_url) {
        document.getElementById('peer_photo').setAttribute('src', this.initDataUnsafe.chat.photo_url);
      } else {
        document.getElementById('peer_photo').style.display = 'none';
      }
    }


    this.telegram.setHeaderColor('secondary_bg_color');
    this.telegram.onEvent('viewportChanged', this.setViewportData);
    this.setViewportData();

    if (this.bg_color_sel){
    let prevBgColorVal = this.bg_color_sel.nativeElement.value;
    const bgColorInput: any = this.bg_color_input.nativeElement;
    const headerColorSel: any = document.getElementById('header_color_sel');
    
    bgColorInput.value = this.telegram.backgroundColor;
    document.body.setAttribute('style', '--bg-color:' + this.telegram.backgroundColor);
    headerColorSel.value = 'secondary_bg_color';
    headerColorSel.addEventListener('change', function (e) {
      const colorKey = e.target.value;
      document.getElementById('top_sect').classList.toggle('second', colorKey === 'secondary_bg_color');
      this.telegram.setHeaderColor(colorKey);
      document.body.setAttribute('style', '--bg-color:' + this.telegram.backgroundColor);
    });
    bgColorInput.addEventListener('change', function (e) {
      const color = e.target.value;
      document.getElementById('bg_color_val').textContent = color;
      headerColorSel.value = 'custom';
      prevBgColorVal = (document.getElementById('bg_color_sel') as any).value;
      this.telegram.setBackgroundColor(color);
      document.body.setAttribute('style', '--bg-color:' + this.telegram.backgroundColor);
    });
    headerColorSel.addEventListener('change', function (e) {
      const colorKey = e.target.value;
      if (colorKey === 'custom') {
        headerColorSel.value = prevBgColorVal;
        bgColorInput.focus();
      } else {
        document.getElementById('bg_color_val').textContent = 'custom...';
        this.telegram.setBackgroundColor(colorKey);
        document.body.setAttribute('style', '--bg-color:' + this.telegram.backgroundColor);
        bgColorInput.value = this.telegram.backgroundColor;
        prevBgColorVal = headerColorSel.value;
      }
    });
    

    this.telegram.onEvent('themeChanged', function () {
      bgColorInput.value = this.telegram.backgroundColor;
      document.body.setAttribute('style', '--bg-color:' + this.telegram.backgroundColor);
    });
  }

    try {
      this.testClipboard(document.getElementById('clipboard_test'));
    } catch (e) { }

    try {
      this.loadCloudKeys(null);
    } catch (e) { }

    try {
      this.biometricInit(null);
    } catch (e) { }

  }

  setViewportData() {
    if (this.viewport_border) this.viewport_border.nativeElement.setAttribute('text', window.innerWidth + ' x ' + this.round(this.telegram.viewportHeight, 2))
      if (this.viewport_stable_border) this.viewport_stable_border.nativeElement.setAttribute('text', window.innerWidth + ' x ' + this.round(this.telegram.viewportStableHeight, 2) +
      ' | is_expanded: ' + (this.telegram.isExpanded ? 'true' : 'false'));
  }
  initMenu() {
    document.body.classList.add('gray');
    this.telegram.setHeaderColor('secondary_bg_color');
  }

  initWebData() {
    this.telegram.onEvent('themeChanged', function () {
      if (this.theme_data)
        this.theme_data.nativeElement.innerHTML = JSON.stringify(this.telegram.themeParams, null, 2);
    });
    if (this.webview_data)
      this.webview_data.nativeElement.innerHTML = JSON.stringify(this.initDataUnsafe, null, 2);
    if (this.theme_data)
      this.theme_data.nativeElement.innerHTML = JSON.stringify(this.telegram.themeParams, null, 2);
    this.checkInitData();
  };

  initViewport() {

    this.telegram.onEvent('viewportChanged', this.viewportSetData);
  }

  viewportSetData() {
    document.querySelector('.viewport-border').setAttribute('text', window.innerWidth + ' x ' + this.round(this.telegram.viewportHeight, 2))
    document.querySelector('.viewport-stable_border').setAttribute('text', window.innerWidth + ' x ' + this.round(this.telegram.viewportStableHeight, 2) +
      ' | is_expanded: ' + (this.telegram.isExpanded ? 'true' : 'false'));
  }
  init(options) {
    document.body.style.visibility = ''
    this.telegram.ready()
    this.telegram.MainButton.setParams({
      text: 'CLOSE WEBVIEW',
      is_visible: true
    }).onClick(close)
    this.telegram.BackButton.onClick(function () {
      this.showAlert('Back button pressed')
    })
    this.telegram.SettingsButton.onClick(function () {
      this.showAlert('Settings opened!')
    })
  };
  expand() {
    this.telegram.expand();
  };
  close() {
    this.telegram.close();
  };
  toggleMainButton(el) {
    const mainButton = this.telegram.MainButton;
    if (mainButton.isVisible) {
      mainButton.hide();
      el.innerHTML = 'Show Main Button';
    } else {
      mainButton.show();
      el.innerHTML = 'Hide Main Button';
    }
  };
  toggleBackButton(el) {
    if (this.BackButton.isVisible) {
      this.BackButton.hide();
      el.innerHTML = 'Show Back Button';
    } else {
      this.BackButton.show();
      el.innerHTML = 'Hide Back Button';
    }
  };

  toggleSettingsButton(el) {
    if (this.SettingsButton.isVisible) {
      this.SettingsButton.hide();
      el.innerHTML = 'Show Settings Button';
    } else {
      this.SettingsButton.show();
      el.innerHTML = 'Hide Settings Button';
    }
  };
  toggleSwipeBehavior(el) {
    if (this.telegram.isVerticalSwipesEnabled) {
      this.telegram.disableVerticalSwipes();
      el.innerHTML = 'Enable Vertical Swypes';
    } else {
      this.telegram.enableVerticalSwipes();
      el.innerHTML = 'Disable Vertical Swypes';
    }
  }

  // version to string Example: '6.9'
  doesntSupport(version) {
    // console.log("version: " + version);
    // console.log("realVersion: " + this.version());
    // console.log("doesntSupport: " + this.isVersionAtLeast(version));
    if (!this.isVersionAtLeast(version)) {
      this.telegram.showAlert('This feature is not supported in this version of Telegram', function () {
        this.telegram.close();
      });
      throw new Error('This feature is not supported in this version of Telegram');
    }
  }

  // actions
  sendMessage(msg_id?, with_webview?) {
    if (!this.initDataUnsafe.query_id) {
      alert('WebViewQueryId not defined');
      return;
    }

    document.querySelectorAll('button').forEach((btn) => btn.disabled = true);

    const btn: any = document.querySelector('#btn_status');
    btn.textContent = 'Sending...';

    this.apiRequest('sendMessage', {
      msg_id: msg_id || '',
      with_webview: !this.initDataUnsafe.receiver && with_webview ? 1 : 0
    }, function (result) {
      document.querySelectorAll('button').forEach((btn) => btn.disabled = false);

      if (result.response) {
        if (result.response.ok) {
          btn.textContent = 'Message sent successfully!';
          btn.className = 'ok';
          btn.style.display = 'block';
        } else {
          btn.textContent = result.response.description;
          btn.className = 'err';
          btn.style.display = 'block';
          alert(result.response.description);
        }
      } else if (result.error) {
        btn.textContent = result.error;
        btn.className = 'err';
        btn.style.display = 'block';
        alert(result.error);
      } else {
        btn.textContent = 'Unknown error';
        btn.className = 'err';
        btn.style.display = 'block';
        alert('Unknown error');
      }
    });
  }
  changeMenuButton(close) {
    document.querySelectorAll('button').forEach((btn) => btn.disabled = true);
    const btnStatus: any = document.querySelector('#btn_status');
    btnStatus.textContent = 'Changing button...';

    this.apiRequest('changeMenuButton', {}, function (result) {
      document.querySelectorAll('button').forEach((btn) => btn.disabled = false);

      if (result.response) {
        if (result.response.ok) {
          btnStatus.textContent = 'Button changed!';
          btnStatus.className = 'ok';
          btnStatus.style.display = 'block';
          this.telegram.close();
        } else {
          btnStatus.textContent = result.response.description;
          btnStatus.className = 'err';
          btnStatus.style.display = 'block';
          alert(result.response.description);
        }
      } else if (result.error) {
        btnStatus.textContent = result.error;
        btnStatus.className = 'err';
        btnStatus.style.display = 'block';
        alert(result.error);
      } else {
        btnStatus.textContent = 'Unknown error';
        btnStatus.className = 'err';
        btnStatus.style.display = 'block';
        alert('Unknown error');
      }
    });
    if (close) {
      setTimeout(function () {
        this.telegram.close();
      }, 50);
    }
  }
  checkInitData() {
    const webViewStatus = document.querySelector('#webview_data_status');
    if (this.initDataUnsafe.query_id &&
      this.initData &&
      webViewStatus.classList.contains('status_need')
    ) {
      webViewStatus.classList.remove('status_need');
      this.apiRequest('checkInitData', {}, function (result) {
        if (result.ok) {
          webViewStatus.textContent = 'Hash is correct (async)';
          webViewStatus.className = 'ok';
        } else {
          webViewStatus.textContent = result.error + ' (async)';
          webViewStatus.className = 'err';
        }
      });
    }
  }
  sendText(spam) {
    const textField: any = document.querySelector('#text_field');
    const text: any = textField.value;
    if (!text.length) {
      return textField.focus();
    }
    if (this.byteLength(text) > 4096) {
      return alert('Text is too long');
    }

    const repeat = spam ? 10 : 1;
    for (let i = 0; i < repeat; i++) {
      this.telegram.sendData(text);
    }
  }
  sendTime(spam) {
    const repeat = spam ? 10 : 1;
    for (let i = 0; i < repeat; i++) {
      this.telegram.sendData((new Date().toString()) as any);
    }
  }
  switchInlineQuery(query, chooseChat) {
    if (chooseChat) {
      const chatTypes: any = []
      const types = ['users', 'bots', 'groups', 'channels'];
      for (let i = 0; i < types.length; i++) {
        const el: any = document.getElementById('select-' + types[i]);
        if (el.checked) {
          chatTypes.push(types[i]);
        }
      }

      if (!chatTypes.length) {
        return this.showAlert('Select chat types!');
      }

      this.telegram.switchInlineQuery(query, chatTypes)
    }

    this.telegram.switchInlineQuery(query)
  }

  // Alerts
  showAlert(message) {
    this.telegram.showAlert(message);
  }
  showConfirm(message) {
    this.telegram.showConfirm(message);
  }
  requestContact() {
    this.telegram.requestContact(function (result) {
      if (result) {
        this.showAlert('Contact granted');
      } else {
        this.showAlert('Contact denied');
      }
    });
  }
  isVersionAtLeast(version) {
    return this.telegram.isVersionAtLeast(version);
  }
  showPopup() {
    this.telegram.showPopup({
      title: 'Popup title',
      message: 'Popup message',
      buttons: [
        { id: 'delete', type: ButtonType.Destructive, text: 'Delete all' },
        { id: 'faq', type: ButtonType.Default, text: 'Open FAQ' },
        { type: ButtonType.Cancel },
      ]
    }, function (buttonId) {
      if (buttonId === 'delete') {
        this.showAlert("'Delete all' selected");
      } else if (buttonId === 'faq') {
        this.telegram.openLink('https://telegram.org/faq');
      }
    });
  }
  showScanQrPopup(linksOnly?: any) {
    this.telegram.showScanQrPopup({
      text: linksOnly ? 'with any link' : 'for test purposes'
    }, function (text) {
      if (linksOnly) {
        const lowerText = text.toString().toLowerCase();
        if (lowerText.substring(0, 7) === 'http://' ||
          lowerText.substring(0, 8) === 'https://'
        ) {
          setTimeout(function () {
            this.telegram.openLink(text);
          }, 50);

          return true;
        }
      } else {
        this.showAlert(text);

        return true;
      }
    });
  }

  // Permissions
  requestLocation(el) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        el.nextElementSibling.innerHTML = '(' + position.coords.latitude + ', ' + position.coords.longitude + ')';
        el.nextElementSibling.className = 'ok';
      });
    } else {
      el.nextElementSibling.innerHTML = 'Geolocation is not supported in this browser.';
      el.nextElementSibling.className = 'err';
    }
    return false;
  }

  requestVideo(el) {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(function (stream) {
        el.nextElementSibling.innerHTML = '(Access granted)';
      });
    } else {
      el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
      el.nextElementSibling.className = 'err';
    }
    return false;
  }

  requestAudio(el) {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (stream) {
        el.nextElementSibling.innerHTML = '(Access granted)';
        el.nextElementSibling.className = 'ok';
      });
    } else {
      el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
      el.nextElementSibling.className = 'err';
    }
    return false;
  }
  requestAudioVideo(el) {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(function (stream) {
        el.nextElementSibling.innerHTML = '(Access granted)';
        el.nextElementSibling.className = 'ok';
      });
    } else {
      el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
      el.nextElementSibling.className = 'err';
    }
    return false;
  }
  testClipboard(el) {
    // if(this.telegram.readTextFromClipboard)
    // this.telegram.readTextFromClipboard((clipText) => {
    //   if (clipText === null) {
    //     el.nextElementSibling.innerHTML = 'Clipboard text unavailable.';
    //     el.nextElementSibling.className = 'err';
    //   } else {
    //     el.nextElementSibling.innerHTML = '(Read from clipboard: Â«' + clipText + 'Â»)';
    //     el.nextElementSibling.className = 'ok';
    //   }
    // });
    // return false;
  }
  requestWriteAccess(el?) {
    this.telegram.requestWriteAccess(function (allowed) {
      if (allowed) {
        el.nextElementSibling.innerHTML = '(Access granted)'
        el.nextElementSibling.className = 'ok'
      } else {
        el.nextElementSibling.innerHTML = '(User declined this request)'
        el.nextElementSibling.className = 'err'
      }
    })
  }
  requestPhoneNumber(el) {
    this.telegram.requestContact(function (sent, event) {
      if (sent) {
        el.nextElementSibling.innerHTML = '(Phone number sent to the bot' + (event && event.responseUnsafe && event.responseUnsafe.contact && event.responseUnsafe.contact.phone_number ? ': +' + event.responseUnsafe.contact.phone_number : '') + ')'
        el.nextElementSibling.className = 'ok'
      } else {
        el.nextElementSibling.innerHTML = '(User declined this request)'
        el.nextElementSibling.className = 'err'
      }
    })
  }
  requestServerTime(el) {
    // this.telegram.invokeCustomMethod('getCurrentTime', {}, function (err, time) {
    //   if (err) {
    //     el.nextElementSibling.innerHTML = '(' + err + ')'
    //     el.nextElementSibling.className = 'err'
    //   } else {
    //     el.nextElementSibling.innerHTML = '(' + (new Date(time * 1000)).toString() + ')'
    //     el.nextElementSibling.className = 'ok'
    //   }
    // });
  }

  editCloudRow(el, event) {
    event.preventDefault();
    const values = this.cloudStorageItems
    const key = el.closest('tr').getAttribute('data-key')
    el.form.reset();
    el.form.key.value = key;
    el.form.value.value = values[key];
  }
  deleteCloudRow(el, event) {
    event.preventDefault();
    const key = el.closest('tr').getAttribute('data-key')
    // this.telegram.CloudStorage.removeItem(key, function (err, deleted) {
    //   if (err) {
    //     this.showAlert('Error: ' + err);
    //   } else {
    //     if (deleted) {
    //       const index = this.cloudStorageKeys.indexOf(key);
    //       if (index >= 0) {
    //         this.cloudStorageKeys.splice(index, 1);
    //       }
    //       delete this.cloudStorageItems[key];
    //     }
    //     el.form.reset();
    //     this.updateCloudRows();
    //   }
    // });
  }
  saveCloudForm(form, event) {
    event.preventDefault();
    const key = form.key.value
    const value = form.value.value
    // this.telegram.CloudStorage.setItem(key, value, function (err, saved) {
    //   if (err) {
    //     this.showAlert('Error: ' + err);
    //   } else {
    //     if (saved) {
    //       if (typeof this.cloudStorageItems[key] === 'undefined') {
    //         this.cloudStorageKeys.push(key);
    //       }
    //       this.cloudStorageItems[key] = value;
    //     }
    //     form.reset();
    //     this.updateCloudRows();
    //   }
    // });
  }

  updateCloudRows() {
    let html = '';
    const keys: any = this.cloudStorageKeys;
    const values = this.cloudStorageItems;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      html += '<tr data-key="' + this.cleanHTML(key) + '"><td>' + this.cleanHTML(key) + '</td><td>' + this.cleanHTML(values[key]) + '</td><td><button onclick="editCloudRow(this, event);">Edit</button><button onclick="deleteCloudRow(this, event);">Delete</button></td></tr>';
    }

    document.getElementById('cloud_rows').innerHTML = html
  }
  loadCloudKeys(el) {
    // this.telegram.CloudStorage.getKeys(function (err, keys) {
    //   if (err) {
    //     this.showAlert('Error: ' + err);
    //   } else {
    //     if (keys.length > 0) {
    //       this.telegram.CloudStorage.getItems(keys, function (err, values) {
    //         if (err) {
    //           this.showAlert('Error: ' + err);
    //         } else {
    //           this.cloudStorageKeys = keys;
    //           this.cloudStorageItems = {};
    //           for (let i = 0; i < keys.length; i++) {
    //             const key = keys[i];
    //             this.cloudStorageItems[key] = values[key];
    //           }
    //           this.updateCloudRows();
    //         }
    //       });
    //     }
    //   }
    // });
  }

  // biometrics
  biometricInit(el) {
    const biometricManager = this.telegram.BiometricManager;
    if (!this.biometricInited) {
      this.biometricInited = true;
      this.telegram.onEvent('biometricManagerUpdated', function () {
        document.getElementById('bm_inited').textContent = biometricManager.isInited ? 'true' : 'false'
        document.getElementById('bm_available').textContent = biometricManager.isBiometricAvailable ? 'true' : 'false'
        document.getElementById('bm_type').textContent = biometricManager.biometricType || ''
        document.getElementById('bm_access_requested').textContent = biometricManager.isAccessRequested ? 'true' : 'false'
        document.getElementById('bm_access_granted').textContent = biometricManager.isAccessGranted ? 'true' : 'false'
        document.getElementById('bm_token_saved').textContent = biometricManager.isBiometricTokenSaved ? 'true' : 'false'
        document.getElementById('bm_device_id').textContent = biometricManager.deviceId || ''
        document.getElementById('bm_settings').style.display = biometricManager.isBiometricAvailable && biometricManager.isAccessRequested && !biometricManager.isAccessGranted ? 'block' : 'none'
      });
    }

    biometricManager.init();
  }
  biometricRequestAccess(el) {
    const biometricManager = this.telegram.BiometricManager;
    if (!biometricManager.isInited) {
      return this.showAlert('Biometric not inited yet!');
    }

    biometricManager.requestAccess({ reason: 'The bot uses biometrics for testing purposes.' }, function (access_granted) {
      if (access_granted) {
        el.nextElementSibling.innerHTML = '(Access granted)';
        el.nextElementSibling.className = 'ok';
      } else {
        el.nextElementSibling.innerHTML = '(Request declined)';
        el.nextElementSibling.className = 'err';
      }
    });
  }
  biometricRequestAuth(el) {
    const biometricManager = this.telegram.BiometricManager;
    if (!biometricManager.isInited) {
      return this.showAlert('Biometric not inited yet!');
    }

    el.nextElementSibling.innerHTML = '';
    el.nextElementSibling.classList.remove('ok', 'err')

    biometricManager.authenticate({ reason: 'The bot requests biometrics for testing purposes.' }, function (success, token) {
      if (success) {
        el.nextElementSibling.innerHTML = '(Success, token: ' + token + ')';
        el.nextElementSibling.className = 'ok';
      } else {
        el.nextElementSibling.innerHTML = '(Failed)';
        el.nextElementSibling.className = 'err';
      }
    });
  }
  biometricOpenSettings(el) {
    const biometricManager = this.telegram.BiometricManager;
    if (!biometricManager.isInited) {
      return this.showAlert('Biometric not inited yet!');
    }

    if (!biometricManager.isBiometricAvailable ||
      !biometricManager.isAccessRequested ||
      biometricManager.isAccessGranted) {
      return false;
    }

    biometricManager.openSettings();
  }
  biometricSetToken(el) {
    const biometricManager = this.telegram.BiometricManager;
    if (!biometricManager.isInited) {
      return this.showAlert('Biometric not inited yet!');
    }

    const token = parseInt(Math.random().toString().substring(2)).toString(16);
    biometricManager.updateBiometricToken(token, function (updated) {
      if (updated) {
        document.getElementById('bm_token_saved').textContent = biometricManager.isBiometricTokenSaved ? 'true' : 'false'
        el.nextElementSibling.innerHTML = '(Updated: ' + token + ')'
        el.nextElementSibling.className = 'ok'
      } else {
        el.nextElementSibling.innerHTML = '(Failed)'
        el.nextElementSibling.className = 'err'
      }
    });
  }
  biometricRemoveToken(el) {
    const biometricManager = this.telegram.BiometricManager;
    if (!biometricManager.isInited) {
      return this.showAlert('Biometric not inited yet!');
    }

    biometricManager.updateBiometricToken('', function (updated) {
      if (updated) {
        document.getElementById('bm_token_saved').textContent = biometricManager.isBiometricTokenSaved ? 'true' : 'false'
        el.nextElementSibling.innerHTML = '(Removed)'
        el.nextElementSibling.className = 'ok'
      } else {
        el.nextElementSibling.innerHTML = '(Failed)'
        el.nextElementSibling.className = 'err'
      }
    });
  }

  // Other
  apiRequest(method, data, onCallback) {
    // DISABLE BACKEND FOR FRONTEND DEMO
    // YOU CAN USE YOUR OWN REQUESTS TO YOUR OWN BACKEND
    // CHANGE THIS CODE TO YOUR OWN
    // return onCallback && onCallback({error: 'This function (' + method + ') should send requests to your backend. Please, change this code to your own.'});

    const authData = this.initData || '';
    fetch('chrnet.fr/index.php', {
      method: 'POST',
      body: JSON.stringify(Object.assign(data, {
        _auth: authData,
        method: method,
      })),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      return response.json();
    }).then(function (result) {
      onCallback && onCallback(result);
    }).catch(function (error) {
      onCallback && onCallback({ error: 'Server error' });
    });
  }


  cleanHTML(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br/>')
  }

  byteLength(str) {
    if (window.Blob) {
      try {
        return new Blob([str]).size;
      } catch (e) {
      }
    }

    let s = str.length;
    for (let i = str.length - 1; i >= 0; i--) {
      const code = str.charCodeAt(i);
      if (code > 0x7f && code <= 0x7ff) {
        s++;
      } else if (code > 0x7ff && code <= 0xffff) {
        s += 2;
      }

      if (code >= 0xDC00 && code <= 0xDFFF) {
        i--;
      }
    }
    return s;
  }

  round(val, d) {
    const k = Math.pow(10, d || 0);
    return Math.round(val * k) / k;
  }
  closeReturnBack() {
    this.telegram.close();
  }
  openLink(url) {
    this.telegram.openLink(url);
  }
  openLinkTryBrowser(url, options) {
    this.telegram.openLink(url, { tryBrowser: options });
  }
  openLinkTryInstantView(url, options) {
    this.telegram.openLink(url, { try_instant_view: options });
  }

  hapticFeedbackImpactOccurred(type) {
    this.telegram.HapticFeedback.impactOccurred(type)
  }
  hapticFeedbackNotificationOccurred(type) {
    this.telegram.HapticFeedback.notificationOccurred(type)
  }
  hapticFeedbackSelectionChanged() {
    this.telegram.HapticFeedback.selectionChanged();
  }
}
