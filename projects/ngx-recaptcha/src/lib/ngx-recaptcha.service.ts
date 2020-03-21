import { Injectable, NgZone, Optional, SkipSelf, Renderer2, Inject, RendererFactory2 } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { DOCUMENT } from '@angular/common'


@Injectable()
export class NgxRecaptchaService {

  private captchaloaded = false
  private readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false)
  private window
  private renderer: Renderer2

  constructor(zone: NgZone, private rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document) {
    this.window = this.document.defaultView
    this.renderer = this.rendererFactory.createRenderer(this.window, null)
    /* the callback needs to exist before the API is loaded */
    // if (typeof window != 'undefined') {
    this.window[<any>"reCaptchaOnloadCallback"] = <any>(() => zone.runOutsideAngular(this.onloadCallback.bind(this)))
    // }
  }

  public getReady(language: string, global: boolean): Observable<boolean> {
    if (!this.captchaloaded) {
      // Init CAPTCHA
      const scriptUrl = !!global ? 'www.recaptcha.net' : 'www.google.com'

      const s = this.renderer.createElement('script');
      s.type = 'text/javascript'
      s.id = 'google_recaptcha_script'
      s.async = true
      s.defer = true
      s.src = `https://${scriptUrl}/recaptcha/api.js?render=explicit&onload=reCaptchaOnloadCallback`
        + (language ? '&hl=' + language : '')

      s.onload = ((ev) => {
        this.captchaloaded = true
      })
      this.renderer.appendChild(this.document.head, s)
    }
    return this.readySubject.asObservable()
  }

  private onloadCallback() {
    this.readySubject.next(true)
  }
}

/* singleton pattern taken from https://github.com/angular/angular/issues/13854 */
export function RECAPTCHA_SERVICE_PROVIDER_FACTORY(ngZone: NgZone, parentDispatcher: NgxRecaptchaService, rendererFactory: RendererFactory2, document) {
  return parentDispatcher || new NgxRecaptchaService(ngZone, rendererFactory, document)
}

export const RECAPTCHA_SERVICE_PROVIDER = {
  provide: NgxRecaptchaService,
  deps: [NgZone, [new Optional(), new SkipSelf(), NgxRecaptchaService], RendererFactory2, DOCUMENT],
  useFactory: RECAPTCHA_SERVICE_PROVIDER_FACTORY
}
