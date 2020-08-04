import { Injectable, NgZone, Optional, SkipSelf, Renderer2, Inject, RendererFactory2 } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { DOCUMENT } from '@angular/common'


@Injectable()
export class NgxRecaptchaService {

  private captchaloaded = false
  private readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false)
  private window
  private renderer: Renderer2

  /**
   * Provides the global scoped captcha object
   */
  public get window_chaptcha() {
    return (<any>window).grecaptcha || (<any>window).captcha
  }

  constructor(zone: NgZone, private rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document) {
    this.window = this.document.defaultView
    this.renderer = this.rendererFactory.createRenderer(this.window, null)
    /* the callback needs to exist before the API is loaded */
    // if (typeof window != 'undefined') {
    this.window[<any>"reCaptchaOnloadCallback"] = <any>(() => zone.runOutsideAngular(this.onloadCallback.bind(this)))
    // }
  }

  public getReady(language: string, global: boolean, script_url?:string): Observable<boolean> {
    if (!this.captchaloaded) {
      // Init CAPTCHA
      const scriptUrl = !!global ? 'www.recaptcha.net' : 'www.google.com'

      const s = this.renderer.createElement('script');
      s.type = 'text/javascript'
      s.id = 'google_recaptcha_script'
      s.async = true
      s.defer = true
      if (!script_url) {
        s.src = `https://${scriptUrl}/recaptcha/api.js?render=explicit&onload=reCaptchaOnloadCallback`
          + (language ? '&hl=' + language : '')
      } else {
        const addParameterToURL = (url, name, value) => {
          const urlh = url.split('#')
          const urlHash = urlh[1] ? `#${urlh[1]}` : ''
          const urls = urlh[0] ? urlh[0].split('?') : []
          const urlsp = urls[1] ? urls[1].split('&') : []
          urlsp.push(`${name}=${value}`)
          const _url = `${urls[0]}?${urlsp.join('&')}`
          return `${_url}${urlHash}`
        }
        let _script_url = script_url
        _script_url = addParameterToURL(_script_url, 'render', 'explicit')
        _script_url = addParameterToURL(_script_url, 'onload', 'reCaptchaOnloadCallback')
        if (language) {
          _script_url = addParameterToURL(_script_url, 'hl', language)
        }
        s.src = `${_script_url}`
      }

      s.onload = ((ev) => {
        this.checkAPIImplementation()
        this.captchaloaded = true
      })
      s.onerror = ((er) => {
        this.captchaloaded = true
        this.readySubject.error(er)
      })
      this.renderer.appendChild(this.document.head, s)
    }
    return this.readySubject.asObservable()
  }

  private onloadCallback() {
    this.readySubject.next(true)
  }

  public checkAPIImplementation() {
    if (!this.window_chaptcha) {
      throw `CAPTCHA API missmatch: The global scope object 'captcha|grecaptcha' is missing . See also Google ReCAPTCHA API.'`
    }
    const methods = ['reset', 'execute', 'getResponse', 'render']
    for (const m of methods) {
      if (!this.window_chaptcha[m]) {
        throw `CAPTCHA API missmatch: The global scope object 'captcha|grecaptcha' requires to contain a function '${m} . See also Google ReCAPTCHA API.'`
      }
      if (typeof this.window_chaptcha[m] === 'function') {
        throw `CAPTCHA API missmatch: The global scope object 'captcha|grecaptcha' requires the property '${m}' to be a function . See also Google ReCAPTCHA API.`
      }
    }
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
