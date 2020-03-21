import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    NgZone,
    ViewChild, ElementRef, forwardRef, Renderer2, Inject, AfterViewInit
} from '@angular/core'
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms'
import { NgxRecaptchaService } from './ngx-recaptcha.service'
import { DOCUMENT } from '@angular/common'

@Component({
    selector: 'ngx-recaptcha',
    template: '<div #target></div>',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NgxRecaptchaComponent),
            multi: true
        }
    ]
})
export class NgxRecaptchaComponent implements OnInit, AfterViewInit, ControlValueAccessor {

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
    @Output() loaded = new EventEmitter<boolean>()

    @ViewChild('target', { static: false }) targetRef: ElementRef
    widgetId: any = null;

    onChange: Function = () => { }
    onTouched: Function = () => { }


    window

    constructor(
        private _captchaService: NgxRecaptchaService,
        private renderer: Renderer2,
        @Inject(DOCUMENT) private document,
        private _zone: NgZone
    ) {
        this.window = this.document.defaultView
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.init();
    }

    init() {
        this._captchaService.getReady(this.language, this.global)
            .subscribe((ready) => {
                if (!ready)
                    return;
                // noinspection TypeScriptUnresolvedVariable,TypeScriptUnresolvedFunction
                this.widgetId = (<any>window).grecaptcha.render(this.targetRef.nativeElement, {
                    'sitekey': this.site_key,
                    'badge': this.badge,
                    'theme': this.theme,
                    'type': this.type,
                    'size': this.size,
                    'tabindex': this.tabindex,
                    'callback': <any>((response: any) => this._zone.run(this.recaptchaCallback.bind(this, response))),
                    'expired-callback': <any>(() => this._zone.run(this.recaptchaExpiredCallback.bind(this)))
                });
                setTimeout(() => {
                    this.loaded.emit(true)
                }, 0);
            });
    }

    // noinspection JSUnusedGlobalSymbols
    public reset() {
        if (this.widgetId === null)
            return;
        // noinspection TypeScriptUnresolvedVariable
        this._zone.runOutsideAngular((<any>window).grecaptcha.reset.bind(this.widgetId))
        this.onChange(null)
    }

    // noinspection JSUnusedGlobalSymbols
    public execute() {
        if (this.widgetId === null)
            return
        // noinspection TypeScriptUnresolvedVariable
        (<any>window).grecaptcha.execute(this.widgetId)
    }

    public getResponse(): string {
        if (this.widgetId === null)
            return null
        // noinspection TypeScriptUnresolvedVariable
        return (<any>window).grecaptcha.getResponse(this.widgetId)
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
