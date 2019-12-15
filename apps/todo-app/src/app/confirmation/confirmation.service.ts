import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {
    Answer,
    ConfirmationComponent,
    ConfirmationData
} from './confirmation.component';

/**
 * Manager of confirmation dialog.
 * Shows simple dialog with simple questions and
 * returns answer via `Observable`-object.
 */
@Injectable()
export class ConfirmationService {

    constructor(
        protected matBottomSheet: MatBottomSheet
    ) {}

    /**
     * Asks user for one of set answers.
     * Automatically hides dialog when user does unsubscribe.
     *
     * @param answers
     * @param title
     * @param question
     * @return
     */
    public confirm<T>(
        answers: Array<Answer<T>>,
        title: string = null,
        question: string = null,
    ): Observable<T> {
        const ref = this.matBottomSheet.open<ConfirmationComponent, ConfirmationData<T>, T>(
            ConfirmationComponent,
            {
                data: {
                    answers,
                    question,
                    title
                } as ConfirmationData<T>
            }
        );

        return ref.afterDismissed().pipe(
            finalize(() => ref.dismiss())
        );
    }
}
