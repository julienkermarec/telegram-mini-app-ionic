import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { BiometricManager, TelegramWebApp, WebApp } from '@m1cron-labs/ng-telegram-mini-app';
import { Observable, of } from 'rxjs';
import { ImpactHapticStyle, NotificationHapticStyle } from 'src/services/environment-services-lib/haptic-feedback/haptic-feedback-service.model';
import { ButtonType } from 'src/services/environment-services-lib/modal/modal-service.model';
import { TgHapticFeedbackService } from 'src/services/tg/haptic-feedback/tg-haptic-feedback.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  ImpactHapticStyle = ImpactHapticStyle;
  NotificationHapticStyle = NotificationHapticStyle;
  private biometricManager: BiometricManager | null = null;
  private biometricInited = false;
  

  constructor(
    @Inject(TelegramWebApp)
    private readonly tgWebApp: WebApp,
  private tgHapticFeedbackService:TgHapticFeedbackService) {
  }

  ngOnInit() {
    console.debug('Telegram Web App is ready', this.tgWebApp.initDataUnsafe);
    // alert('Telegram Web App is ready');
  }

  ngOnDestroy(): void {
    this.tgWebApp.close();
  }


  isBiometryAvailable(): Observable<boolean> {
    if (this.biometricManager == null) {
      return of(false);
    }

    return of(this.biometricManager.isBiometricAvailable);
  }

  requestAccess(reason: string): Observable<boolean> {
    return new Observable<boolean>(subscriber => {
      this.biometricManager!.requestAccess({ reason }, (isGranted: boolean) => {
        subscriber.next(isGranted);
        subscriber.complete();
      });
    });
  }

  authenticate(reason: string): Observable<boolean> {
    return new Observable<boolean>(subscriber => {
      this.biometricManager!.authenticate({ reason }, (isAuthenticated: boolean) => {
        subscriber.next(isAuthenticated);
        subscriber.complete();
      });
    });
  }

  expand() {
    this.tgWebApp.expand();
  }

  close() {
    this.tgWebApp.close();
  }

  // Alerts
  showAlert(message: any) {
    this.tgWebApp.showAlert(message);
  }
  showConfirm(message: any) {
    this.tgWebApp.showConfirm(message);
  }


  toggleMainButton(el:any) {
    const mainButton = this.tgWebApp.MainButton;
    if (mainButton.isVisible) {
        mainButton.hide();
        el.innerHTML = 'Show Main Button';
    } else {
        mainButton.show();
        el.innerHTML = 'Hide Main Button';
    }
}
toggleBackButton(el:any) {
    if (this.tgWebApp.BackButton.isVisible) {
      this.tgWebApp.BackButton.hide();
        el.innerHTML = 'Show Back Button';
    } else {
      this.tgWebApp.BackButton.show();
        el.innerHTML = 'Hide Back Button';
    }
}
toggleSettingsButton(el:any) {
    if (this.tgWebApp.SettingsButton.isVisible) {
      this.tgWebApp.SettingsButton.hide();
        el.innerHTML = 'Show Settings Button';
    } else {
      this.tgWebApp.SettingsButton.show();
        el.innerHTML = 'Hide Settings Button';
    }
}
toggleSwipeBehavior(el:any) {
    if (this.tgWebApp.isVerticalSwipesEnabled) {
      this.tgWebApp.disableVerticalSwipes();
        el.innerHTML = 'Enable Vertical Swypes';
    } else {
      this.tgWebApp.enableVerticalSwipes();
        el.innerHTML = 'Disable Vertical Swypes';
    }
}

requestContact() {
  this.tgWebApp.requestContact((result: any) => {
      if (result) {
          this.showAlert('Contact granted');
      } else {
          this.showAlert('Contact denied');
      }
  });
}
isVersionAtLeast(version:any) {
  return this.tgWebApp.isVersionAtLeast(version);
}
// version to string Example: '6.9'
doesntSupport(version: any) {
    // console.log("version: " + version);
    // console.log("realVersion: " + this.version());
    // console.log("doesntSupport: " + this.isVersionAtLeast(version));
    if (!this.isVersionAtLeast(version)) {
      this.tgWebApp.showAlert('This feature is not supported in this version of Telegram',  () => {
        this.tgWebApp.close();
        });
        throw new Error('This feature is not supported in this version of Telegram');
    }
}
// biometrics
biometricInit(el?:any) {
    const biometricManager = this.tgWebApp.BiometricManager;
    if (!this.biometricInited) {
        this.biometricInited = true;
        this.tgWebApp.onEvent('biometricManagerUpdated', ()=> {
          console.log('biometricManager',biometricManager);
            // document.getElementById('bm_inited').textContent = biometricManager.isInited ? 'true' : 'false'
            // document.getElementById('bm_available').textContent = biometricManager.isBiometricAvailable ? 'true' : 'false'
            // document.getElementById('bm_type').textContent = biometricManager.biometricType || ''
            // document.getElementById('bm_access_requested').textContent = biometricManager.isAccessRequested ? 'true' : 'false'
            // document.getElementById('bm_access_granted').textContent = biometricManager.isAccessGranted ? 'true' : 'false'
            // document.getElementById('bm_token_saved').textContent = biometricManager.isBiometricTokenSaved ? 'true' : 'false'
            // document.getElementById('bm_device_id').textContent = biometricManager.deviceId || ''
            // document.getElementById('bm_settings').style.display = biometricManager.isBiometricAvailable && biometricManager.isAccessRequested && !biometricManager.isAccessGranted ? 'block' : 'none'
        });
    }

    biometricManager.init();
}
biometricRequestAccess(el?:any) {
    const biometricManager = this.tgWebApp.BiometricManager;
    if (!biometricManager.isInited) {
        return this.showAlert('Biometric not inited yet!');
    }

    biometricManager.requestAccess({reason: 'The bot uses biometrics for testing purposes.'}, (access_granted:any) => {
        if (access_granted) {
            el.nextElementSibling.innerHTML = '(Access granted)';
            el.nextElementSibling.className = 'ok';
        } else {
            el.nextElementSibling.innerHTML = '(Request declined)';
            el.nextElementSibling.className = 'err';
        }
    });
}
  biometricRequestAuth(el?:any) {
    const biometricManager = this.tgWebApp.BiometricManager;
    if (!biometricManager.isInited) {
      return this.showAlert('Biometric not inited yet!');
    }

    el.nextElementSibling.innerHTML = '';
    el.nextElementSibling.classList.remove('ok', 'err')

    biometricManager.authenticate({ reason: 'The bot requests biometrics for testing purposes.' }, (success: any, token: any) => {
      if (success) {
        el.nextElementSibling.innerHTML = '(Success, token: ' + token + ')';
        el.nextElementSibling.className = 'ok';
      } else {
        el.nextElementSibling.innerHTML = '(Failed)';
        el.nextElementSibling.className = 'err';
      }
    });
  }

  biometricOpenSettings(el?:any) {
    const biometricManager = this.tgWebApp.BiometricManager;
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
biometricSetToken(el?:any) {
    const biometricManager = this.tgWebApp.BiometricManager;
    if (!biometricManager.isInited) {
        return this.showAlert('Biometric not inited yet!');
    }

    const token = parseInt(Math.random().toString().substring(2)).toString(16);
    biometricManager.updateBiometricToken(token, (updated:any) => {
        if (updated) {
            // document.getElementById('bm_token_saved').textContent = biometricManager.isBiometricTokenSaved ? 'true' : 'false'
            el.nextElementSibling.innerHTML = '(Updated: ' + token + ')'
            el.nextElementSibling.className = 'ok'
        } else {
            el.nextElementSibling.innerHTML = '(Failed)'
            el.nextElementSibling.className = 'err'
        }
    });
}
biometricRemoveToken(el?:any) {
    const biometricManager = this.tgWebApp.BiometricManager;
    if (!biometricManager.isInited) {
        return this.showAlert('Biometric not inited yet!');
    }

    biometricManager.updateBiometricToken('', (updated:any) => {
        if (updated) {
            // document.getElementById('bm_token_saved').textContent = biometricManager.isBiometricTokenSaved ? 'true' : 'false'
            el.nextElementSibling.innerHTML = '(Removed)'
            el.nextElementSibling.className = 'ok'
        } else {
            el.nextElementSibling.innerHTML = '(Failed)'
            el.nextElementSibling.className = 'err'
        }
    });
}

  showPopup() {
    this.tgWebApp.showPopup({
        title  : 'Popup title',
        message: 'Popup message',
        buttons: [
            {id: 'delete', type: ButtonType.Destructive, text: 'Delete all'},
            {id: 'faq', type: ButtonType.Default, text: 'Open FAQ'},
            {type: ButtonType.Cancel},
        ]
    }, (buttonId:any) => {
        if (buttonId === 'delete') {
          this.tgWebApp.showAlert("'Delete all' selected");
        } else if (buttonId === 'faq') {
          this.tgWebApp.openLink('https://telegram.org/faq');
        }
    });
}
showScanQrPopup(linksOnly?: any) {
  this.tgWebApp.showScanQrPopup({
        text: linksOnly ? 'with any link' : 'for test purposes'
    }, (text:any) => {
        if (linksOnly) {
            const lowerText = text.toString().toLowerCase();
            if (lowerText.substring(0, 7) === 'http://' ||
                lowerText.substring(0, 8) === 'https://'
            ) {
                setTimeout( () => {
                  this.tgWebApp.openLink(text);
                }, 50);

                return true;
            }
            else {
              return false;
            }
        } else {
          this.tgWebApp.showAlert(text);

            return true;
        }
    });
}

// Permissions
requestLocation(el?:any) {
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
requestVideo(el?:any) {
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({audio: false, video: true}).then(function (stream) {
            el.nextElementSibling.innerHTML = '(Access granted)';
        });
    } else {
        el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
        el.nextElementSibling.className = 'err';
    }
    return false;
}
requestAudio(el?:any) {
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function (stream) {
            el.nextElementSibling.innerHTML = '(Access granted)';
            el.nextElementSibling.className = 'ok';
        });
    } else {
        el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
        el.nextElementSibling.className = 'err';
    }
    return false;
}
requestAudioVideo(el:any) {
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(function (stream) {
            el.nextElementSibling.innerHTML = '(Access granted)';
            el.nextElementSibling.className = 'ok';
        });
    } else {
        el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
        el.nextElementSibling.className = 'err';
    }
    return false;
}
testClipboard(el?:any) {
  this.tgWebApp.readTextFromClipboard( (clipText:any) => {
        if (clipText === null) {
            el.nextElementSibling.innerHTML = 'Clipboard text unavailable.';
            el.nextElementSibling.className = 'err';
        } else {
            el.nextElementSibling.innerHTML = '(Read from clipboard: Â«' + clipText + 'Â»)';
            el.nextElementSibling.className = 'ok';
        }
    });
    return false;
}
requestWriteAccess(el?: any) {
  this.tgWebApp.requestWriteAccess((allowed:any) => {
        if (allowed) {
            el.nextElementSibling.innerHTML = '(Access granted)'
            el.nextElementSibling.className = 'ok'
        } else {
            el.nextElementSibling.innerHTML = '(User declined this request)'
            el.nextElementSibling.className = 'err'
        }
    })
}
requestPhoneNumber(el?:any) {
  this.tgWebApp.requestContact((sent:any, event:any) => {
        if (sent) {
            el.nextElementSibling.innerHTML = '(Phone number sent to the bot' + (event && event.responseUnsafe && event.responseUnsafe.contact && event.responseUnsafe.contact.phone_number ? ': +' + event.responseUnsafe.contact.phone_number : '') + ')'
            el.nextElementSibling.className = 'ok'
        } else {
            el.nextElementSibling.innerHTML = '(User declined this request)'
            el.nextElementSibling.className = 'err'
        }
    })
}

impactOccurred(style:ImpactHapticStyle){
  this.tgHapticFeedbackService.impactOccurred(style);
}
notificationOccurred(style:NotificationHapticStyle){
  this.tgHapticFeedbackService.notificationOccurred(style);
}

}