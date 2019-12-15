import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Optional
} from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

export interface Answer<T = boolean> {
    title: string;
    text?: string;
    value: T;
}

export interface ConfirmationData<T= boolean> {
    answers: Array<Answer<T>>;
    question: string;
    title: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'confirmation-dialog',
    styleUrls: ['./confirmation.component.scss'],
    templateUrl: './confirmation.component.html'
})
export class ConfirmationComponent {

    constructor(
        protected bottomSheetRef: MatBottomSheetRef,
        @Optional() @Inject(MAT_BOTTOM_SHEET_DATA)
            public customOptions: ConfirmationData
    ) { }

    dismiss(result) {
        this.bottomSheetRef.dismiss(result);
    }
}
