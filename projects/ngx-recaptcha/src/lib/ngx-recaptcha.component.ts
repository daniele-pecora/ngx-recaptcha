import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    NgZone,
    ViewChild, ElementRef, forwardRef, Renderer2, Inject, AfterViewInit, OnChanges, SimpleChanges
} from '@angular/core'
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms'
import { NgxRecaptchaService, WidgetCaptchaInfo } from './ngx-recaptcha.service'

@Component({
    selector: 'ngx-recaptcha',
    template: `
    <!-- required to be an HTML element (no ng-container) -->
    <div #target></div>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NgxRecaptchaComponent),
            multi: true
        }
    ]
})
export class NgxRecaptchaComponent implements OnInit, AfterViewInit, ControlValueAccessor, OnChanges {

    @Input() site_key: string = null;
    @Input() theme = 'light'
    @Input() type = 'image'
    @Input() size = 'normal'
    @Input() tabindex = 0
    @Input() badge = 'bottomright'
    /* Available languages: https://developers.google.com/recaptcha/docs/language */
    @Input() language: string = null
    @Input() global: boolean = false
    @Input() initCallback = 'reCaptchaOnloadCallback'

    @Output() captchaResponse = new EventEmitter<string>()
    @Output() captchaExpired = new EventEmitter()

    @Input() script_url: string
    @Output() loaded = new EventEmitter<boolean>()
    @Output() error = new EventEmitter<boolean>()
    /**
     * Unique name for the captcha element.<br/>
     * Will be used to map all callbacks to the corresponding captcha object.<br/>
     * If not set a random name will be created.
     */
    @Input() name: string = null

    @ViewChild('target', { static: false }) targetRef: ElementRef
    /**
     * will be set when the captcha is rendered
     */
    captchaWidgetId: any = null
    /**
     * Unique name for the captcha element.<br/>
     * Will be used to map all callbacks to the corresponding captcha object.<br/>
     * If not set a random name will be created.
     */
    captchaWidgetName: string = this.name

    onChange: Function = () => { }
    onTouched: Function = () => { }

    get window_captcha() {
        return this._captchaService.window_captcha
    }

    wInfo: WidgetCaptchaInfo

    constructor(
        private _captchaService: NgxRecaptchaService,
        private _zone: NgZone) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.name) {
            if (changes.name.currentValue !== changes.name.previousValue) {
                if (!changes.name.currentValue) {
                    this.captchaWidgetName = NgxRecaptchaService.getNameIfMissing(changes.name.currentValue)
                }
                this.captchaWidgetName = changes.name.currentValue
            }
        }
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.init();
    }

    public init() {
        this.captchaWidgetName = NgxRecaptchaService.getNameIfMissing(this.captchaWidgetName)

        const options = {
            'sitekey': this.site_key,
            'badge': this.badge,
            'theme': this.theme,
            'type': this.type,
            'size': this.size,
            'tabindex': this.tabindex,
            'callback': <any>((response: any) => this._zone.run(this.recaptchaCallback.bind(this, response))),
            'expired-callback': <any>(() => this._zone.run(this.recaptchaExpiredCallback.bind(this)))
        }

        this._captchaService.getReady(this.captchaWidgetName, this.language, this.global, this.script_url)
            .subscribe(({ success, widgetName, wInfo }) => {
                if (widgetName !== this.captchaWidgetName)
                    return
                this.wInfo = wInfo
                if (!success)
                    return;
                try {
                    // noinspection TypeScriptUnresolvedVariable,TypeScriptUnresolvedFunction
                    this.captchaWidgetId = this.window_captcha.render(this.targetRef.nativeElement, options)
                } catch (e) {
                    console.error('Captcha:', `${this.captchaWidgetName}/${this.captchaWidgetId}`, e)
                }
                setTimeout(() => {
                    this.loaded.emit(true)
                }, 0);
            },
                (error) => {
                    setTimeout(() => {
                        this.error.emit(error)
                    }, 0);
                }), () => {

                }
    }

    // noinspection JSUnusedGlobalSymbols
    public reset() {
        if (this.captchaWidgetId === null)
            return;
        // noinspection TypeScriptUnresolvedVariable
        this._zone.runOutsideAngular(this.window_captcha.reset.bind(this, this.captchaWidgetId))
        this.onChange(null)
    }

    // noinspection JSUnusedGlobalSymbols
    public execute() {
        if (this.captchaWidgetId === null)
            return
        // noinspection TypeScriptUnresolvedVariable
        this.window_captcha.execute(this.captchaWidgetId)
    }

    public getResponse(): string {
        if (this.captchaWidgetId === null)
            return null
        // noinspection TypeScriptUnresolvedVariable
        return this.window_captcha.getResponse(this.captchaWidgetId)
    }
    
    // noinspection JSUnusedGlobalSymbols
    public clear() {
        if (this.captchaWidgetId === null)
            return
        this.reset()
        // noinspection TypeScriptUnresolvedVariable
        this._captchaService.clear(this.wInfo)
    }

    writeValue(newValue: any): void {
        /* ignore it */
    }

    registerOnChange(fn: any): void {
        this.onChange = fn
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn
    }

    private recaptchaCallback(response: string) {
        this.onChange(response)
        this.onTouched()
        this.captchaResponse.emit(response)
    }

    private recaptchaExpiredCallback() {
        this.onChange(null)
        this.onTouched()
        this.captchaExpired.emit()
    }
}
