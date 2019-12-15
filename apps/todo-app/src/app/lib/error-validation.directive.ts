import {
    AfterViewInit,
    ApplicationRef,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    Directive,
    ElementRef,
    HostListener,
    Inject,
    InjectionToken,
    Injector,
    Input,
    NgZone,
    OnDestroy,
    Renderer2,
    ViewContainerRef
} from '@angular/core';
import { NgControl, ValidationErrors } from '@angular/forms';

import { DOCUMENT } from '@angular/common';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { PlacementArray } from '@ng-bootstrap/ng-bootstrap/util/positioning';

import _ from 'lodash';

import { Subject, Subscription, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';

/**
 * Токен, который прокидывает общий канал
 * для оповещения директив о том, что нужно "светануться" —
 * раскрыть все толтипы с ошибками на странице.
 *
 * @type {InjectionToken<Subject<void>>}
 */
export const ERROR_DIRECTIVE_FLASH = new InjectionToken<Subject<void>>('ErrorDirectiveFlash');
export const errorDirectiveFlashFactory = () => new Subject<void>();

export const ERROR_DIRECTIVE_FLASH_PROVIDER = {
    provide: ERROR_DIRECTIVE_FLASH,
    useFactory: errorDirectiveFlashFactory
};

@Directive({
    /* tslint:disable */
    selector: '[formControlName],[formControl],[formGroup][useValidation]'
    /* tslint:enable */
})
export class ErrorValidationDirective extends NgbTooltip implements AfterViewInit, OnDestroy {

    @Input()
    public useValidation = true;

    @Input() autoClose = false;
    @Input() placement: PlacementArray = ['right', 'bottom', 'top', 'left'];
    @Input() triggers = 'manual';
    @Input() tooltipClass = 'tooltip-error';
    @Input() container = 'body';
    @Input() errorMessage: ValidationErrors = {};

    /**
     * Если тип ошибки не найден, то выводим стандарное сообщение
     */
    @Input() defaultErrorMessage = 'Invalid data';

    protected isFocused = false;
    protected subscription: Subscription;
    protected flashed = false;

    constructor(
        elementRef: ElementRef<HTMLElement>,
        renderer: Renderer2,
        injector: Injector,
        componentFactoryResolver: ComponentFactoryResolver,
        viewContainerRef: ViewContainerRef,
        config: NgbTooltipConfig,
        applicationRef: ApplicationRef,

        @Inject(DOCUMENT) _document: any,
        @Inject(ERROR_DIRECTIVE_FLASH)
            protected errorDirectiveFlash: Subject<void>,

        protected ngZone: NgZone,
        protected changeDetector: ChangeDetectorRef,
        protected ngControl: NgControl
    ) {
        super(
            elementRef,
            renderer,
            injector,
            componentFactoryResolver,
            viewContainerRef,
            config,
            ngZone,
            _document,
            changeDetector,
            applicationRef
        );
    }

    public ngAfterViewInit(): void {

        if (!this.useValidation) {
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            this.subscription = merge(
                this.ngControl.statusChanges,
                of(this.ngControl.status),
                this.errorDirectiveFlash.pipe(
                    map(() =>
                        this.flashed = true, this.ngControl.status
                    )
                )
            ).subscribe((status) => {
                this.onChanges(status);
            });
        });
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        super.ngOnDestroy();
    }

    @HostListener('mouseover') onHover() {
        if (this.hasToShow()) {
            this.setupErrorMessage();
            this.open();
        }
    }

    @HostListener('mouseout') onMouseOut() {
        if (this.hasToHide()) { this.close(); }
    }

    @HostListener('focusin') onFocus() {
        this.isFocused = true;

        if (this.hasToShow()) {
            this.setupErrorMessage();
            this.open();
        }
    }

    @HostListener('focusout') onBlur() {
        this.isFocused = false;
        if (this.hasToHide()) { this.close(); }
    }

    protected onChanges(status): void {
        if (status === 'INVALID') {
            const control = this.ngControl.control;
            this.setupErrorMessage();

            if (!this.isOpen()) {
                // сразу показывается сообщение,
                // если поле в фокусе
                if (this.isFocused) {
                    this.disableTooltip = false;
                    this.open();
                }
            } else {
                // Костыльное динамическое обновление текста
                (this['_windowRef'].location.nativeElement as Element)
                    .querySelector('.tooltip-inner')
                    .innerHTML = this.ngbTooltip as string;
            }

            if ((control.value && control.untouched) || this.flashed) {
                control.markAsTouched();
                this.changeDetector.markForCheck();
                this.changeDetector.detectChanges();
            }
        } else {
            this.disableTooltip = true;
            this.ngbTooltip = null;
            this.changeDetector.markForCheck();
            this.changeDetector.detectChanges();
        }
    }

    protected hasToShow() {
        return this.useValidation
            && !this.ngControl.valid
            && !this.isOpen()
            && (this.ngControl.touched || this.flashed);
    }

    protected hasToHide() {
        return this.useValidation
            && !this.ngControl.valid
            && this.isOpen()
            && !this.isFocused;
    }

    protected setupErrorMessage() {
        const { errors } = this.ngControl.control;

        this.ngbTooltip = _(errors)
            .keys()
            .map(key => _.get(this.errorMessage, key, errors[key]))
            .first() || this.defaultErrorMessage;
    }
}
