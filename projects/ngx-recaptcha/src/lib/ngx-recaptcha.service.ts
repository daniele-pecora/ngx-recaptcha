import { Injectable, NgZone, Optional, SkipSelf, Renderer2, Inject, RendererFactory2 } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { DOCUMENT } from '@angular/common'


@Injectable()
export class NgxRecaptchaService {

  private captchaloaded = false
  private readySubject: BehaviorSubject<{ success: boolean, widgetName: string, wInfo?: WidgetCaptchaInfo }> = new BehaviorSubject({ success: false, widgetName: null, wInfo: null })
  private window
  private renderer: Renderer2

  /**
   * Provides the global scoped captcha object
   */
  public get window_captcha() {
    return (<any>this.window).grecaptcha || (<any>this.window).captcha
  }

  constructor(private zone: NgZone, private rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document) {
    this.window = this.document.defaultView
    this.renderer = this.rendererFactory.createRenderer(this.window, null)
    ///* the callback needs to exist before the API is loaded */
    //this.window[<any>"reCaptchaOnloadCallback"] = <any>(() => this.zone.runOutsideAngular(this.onloadCallback.bind(this)))
  }
  /**
   * Creates an function compatible name
   * @param name the current widget name
   */
  static getNameIfMissing(name:string):string {
    return (name || `___c_${(+new Date()) + '_' + (Math.random())}`).replace(new RegExp('[\\W]', 'ig'), '_')
  }
  
  public createCallback(widgetName: string):WidgetCaptchaInfo {
      // create a function compliant name
      const name = NgxRecaptchaService.getNameIfMissing(widgetName)
      const captchaCallbackName = `captchaCallback_${name}`
      const captchaCallbackNameInt = `captchaCallbackNameInt_${name}`
      const scriptId = `___grecaptcha__${captchaCallbackNameInt}`

      const wInfo = {
        name: name,
        captchaCallbackName: captchaCallbackName,
        captchaCallbackNameInt: captchaCallbackNameInt,
        scriptId: scriptId
      }
    /* the callback needs to exist before the API is loaded */
      this.window[captchaCallbackNameInt] = <any>(() => this.zone.runOutsideAngular(this.onloadCallback.bind(this, name, wInfo)))

    return wInfo
  }
  
  public getReady(widgetName: string, language: string, global: boolean, script_url?: string): Observable<{ success: boolean, widgetName: string, wInfo?: WidgetCaptchaInfo }> {
    // Init CAPTCHA
    const wInfo = this.createCallback(widgetName)
    return this.getReadyWithWInfo(wInfo, language, global, script_url)
  }

  private getReadyWithWInfo(wInfo: WidgetCaptchaInfo, language: string, global: boolean, script_url?: string): Observable<{ success: boolean, widgetName: string, wInfo?:WidgetCaptchaInfo }> {
    if (!this.captchaloaded || !this.document.querySelector(`script#${wInfo.scriptId}`)) {
      // Init CAPTCHA

      const s = this.renderer.createElement('script');
      s.type = 'text/javascript'
      s.id = wInfo.scriptId//'google_recaptcha_script'
      s.async = true
      s.defer = true
      if (!script_url) {
        const scriptUrl = !!global ? 'www.recaptcha.net' : 'www.google.com'
        s.src = `https://${scriptUrl}/recaptcha/api.js?render=explicit&onload=reCaptchaOnloadCallback`
          + (language ? '&hl=' + language : '')
        s.src = `https://${scriptUrl}/recaptcha/api.js?render=explicit&onload=${wInfo.captchaCallbackNameInt}`
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
        _script_url = addParameterToURL(_script_url, 'onload', `${wInfo.captchaCallbackNameInt}`)
        if (language) {
          _script_url = addParameterToURL(_script_url, 'hl', language)
        }
        s.src = `${_script_url}`
      }

      s.onload = ((ev) => {
        try { this.checkAPIImplementation() } catch (e) { 
          this.readySubject.error(e) 
        }
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

  private onloadCallback(widgetId: string, wInfo?: WidgetCaptchaInfo) {
    this.readySubject.next({ success: true, widgetName: widgetId, wInfo: wInfo })
  }

  public checkAPIImplementation() {
    if (!this.window_captcha) {
      throw `CAPTCHA API missmatch: The global scope object 'captcha|grecaptcha' is missing . See also Google ReCAPTCHA API.'`
    }
    const methods = ['ready']//['ready', 'reset', 'execute', 'getResponse', 'render']
    for (const m of methods) {
      if (!this.window_captcha[m]) {
        throw `CAPTCHA API missmatch: The global scope object 'captcha|grecaptcha' requires to contain a function '${m}' . See also Google ReCAPTCHA API.`
      }
      if (!(typeof this.window_captcha[m] === 'function')) {
        throw `CAPTCHA API missmatch: The global scope object 'captcha|grecaptcha' requires the property '${m}' to be a function but is type of ${typeof(this.window_captcha[m])}. See also Google ReCAPTCHA API.`
      }
    }
  }

  public clear(wInfo: WidgetCaptchaInfo) {
    if (wInfo) {
      if (this.window[wInfo.captchaCallbackName])
        delete this.window[wInfo.captchaCallbackName]
      if (this.window[wInfo.captchaCallbackNameInt])
        delete this.window[wInfo.captchaCallbackNameInt]
      const scriptTag = this.document.querySelector(`script#${wInfo.scriptId}`)
      if (scriptTag)
        scriptTag.remove()
      if (this.window['grecaptcha'])
        try { delete this.window['grecaptcha'] } catch (e) { this.window['grecaptcha'] = undefined }
      if (this.window['captcha'])
        try { delete this.window['captcha'] } catch (e) { this.window['captcha'] = undefined }
    }
  }
}

export interface WidgetCaptchaInfo {
  name: string
  captchaCallbackName: string
  captchaCallbackNameInt: string
  scriptId: string
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