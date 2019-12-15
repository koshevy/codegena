import {
    Directive,
    Host,
    Input,
    Optional,
    OnInit,
    OnDestroy
} from '@angular/core';

import {
    DefaultValueAccessor,
    NgControl
} from '@angular/forms';

import * as _ from 'lodash';
import { Subscription } from 'rxjs/internal/Subscription';

@Directive({
    /* tslint:disable */
    selector: '[nullableControl]'
    /* tslint:enable */
})
export class NullableAccessorDirective implements OnInit, OnDestroy {

    /**
     * Устанавливать null принудительно к текущему контролу,
     * если значение = пустой строке
     */
    @Input('nullableControl') nullableControl = true;

    private subscriber: Subscription;

    constructor(
        @Optional() @Host()
        protected defaultValueAccessor: DefaultValueAccessor,
        protected ngControl: NgControl,
    ) {
        if (defaultValueAccessor) {
            defaultValueAccessor.registerOnChange = (fn) => {
                defaultValueAccessor.onChange = (value) => {
                    if (_.isString(value) && value.trim() === '') {
                        value = null;
                    }

                    fn(value);
                };
            };

            defaultValueAccessor.registerOnChange(
                defaultValueAccessor.onChange
            );
        }

    }

    ngOnInit(): void {
        if (this.defaultValueAccessor) {
            return;
        }
        const control = _.get(this.ngControl, 'control');
        if (this.nullableControl && control) {
            this.subscriber = control.valueChanges.subscribe(value => {
                if (_.isString(value) && value.trim() === '') {
                    control.setValue(null);
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.subscriber && !this.subscriber.closed) {
            this.subscriber.unsubscribe();
        }
    }

}
