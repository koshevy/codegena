// ▓ ░░░ RxJS

import { Observable, Subject, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    delay,
    first,
    map,
    pairwise,
    share,
    startWith,
    tap,
    timeout
} from 'rxjs/operators';

// ▓ ░░░ Angular

import { Injectable } from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    ValidatorFn,
    ValidationErrors
} from '@angular/forms';

// ▓ ░░░ Misc

import _ from 'lodash';
import Ajv from 'ajv';
import * as patchAjvErrors from 'ajv-errors';

/**
 * Тип валидации для поля
 */
export enum PropertyValidationType {
    SingleField = 'singleField'
}

/**
 * Сервис для управления валидацией для форм
 * с помощью JSON Schema
 */
@Injectable()
export class JsonValidationService {

    protected static avjFactory;
    protected ajvValidator;

    /**
     * Задержка ожидания результата групповых валидаций.
     * Нужна для того, чтобы из нескольких идущих подряд
     * проверок выполнялась последняя.
     */
    public validationDebounce = 100;

    /**
     * Поток для данных определенных групп элементов формы,
     * в котором циркулируют данные, идущие на проверку.
     * Сюда отправяются данные, а слушаться они должны через
     * {@link groupDataFlow}.
     */
    protected groupDataFlow: Subject<any>;

    protected groupDataFlowPipe: Observable<null | {[path: string]: ValidationErrors}>;

    protected addKeywordInMessage: boolean = false;

    /**
     * По-умолчанию работа приостановлена, чтобы при инициализации
     * групп не было прогонов вхолостую.
     * @type {boolean}
     */
    protected isSuspended = true;

    constructor() { }

    /**
     * Назначение JSON-Schema для этого сервиса
     * @param schema
     */
    public setScheme(schema, ajvOptions?): void {
        if (!JsonValidationService.avjFactory) {
            JsonValidationService.avjFactory = new Ajv({
                allErrors: true,
                coerceTypes: false
            });
            JsonValidationService.avjFactory.addFormat(
                'float',
                v => _.isNumber(v)
            );

            patchAjvErrors(JsonValidationService.avjFactory, {
                keepErrors: false,
                singleError: false
            });
        }

        // готовый Schema-валидатор
        this.ajvValidator = JsonValidationService.avjFactory
            .compile(schema);
    }

    public suspendOff(): void {
        this.isSuspended = false;
    }

    public suspendOn(): void {
        this.isSuspended = true;
    }

    /**
     * Путь, с которым ассоциировано поле, для которого
     * создается валидатор
     *
     * @param {string} path
     * @param {PropertyValidationType} validationType
     * @param {any[]} onDutyValues
     * Служебные поля, которые не подлежат валидации,
     * т.к. не являются значениями. Как правило, использются в
     * цикле, обрабатываются, и заменяются другими значениями,
     *
     * @returns {ValidatorFn}
     */
    public createValidator(
        path: string,
        validationType: PropertyValidationType = PropertyValidationType.SingleField,
        onDutyValues: any[] = []
    ): ValidatorFn | AsyncValidatorFn {
        switch (validationType) {
            // "Ленивый" способ валидации по одному полю
            case PropertyValidationType.SingleField:
                return (control: AbstractControl) => {
                    // служебные значения не подлежат валидации
                    if (_.includes(onDutyValues, control.value)) {
                        return null;
                    }

                    const data = {};
                    _.set(data, path, control.value);

                    return this.ajvValidator(data)
                        ? null
                        : this.getErrorsByPath(path, this.groupErrors(this.ajvValidator.errors));
                };
        }
    }

    protected groupErrors(errors) {
        return _.transform(
            errors,
            (obj, ajvError, i) => {
                if (ajvError['dataPath']) {
                    const path = _.trim(ajvError['dataPath'], './')
                        .replace('/', '.');

                    const subObj = obj[path] || {};
                    const keyword = ajvError['keyword'] || 'unknown';
                    const message = _.get(
                        ajvError,
                        'message'
                    );

                    if (!obj[path]) {
                        obj[path] = subObj;
                    }

                    subObj[keyword] = [
                        this.addKeywordInMessage ? `[${keyword}]` : '',
                        message
                    ].join(' ');
                }
            },
            {}
        );
    }

    protected getErrorsByPath(path, result) {
        let particularResult: object | {} = null;
        if (result) {
            _.each(result, (v, k: string) => {
                if ((k === path) || (k.indexOf(`${path}.`) === 0)) {
                    if (!particularResult) {
                        particularResult = {};
                    }
                    particularResult = _.assign(
                        particularResult[path] || {},
                        v
                    );
                }
            });
        }

        // отправляет только ошибки, которые
        // относятся к этому полю
        return particularResult;
    }
}
