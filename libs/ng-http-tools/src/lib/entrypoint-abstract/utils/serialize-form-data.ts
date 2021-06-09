import {
    HttpParams,
    HttpParameterCodec,
    HttpUrlEncodingCodec
} from '@angular/common/http';
import { isObjectLike } from 'lodash';

const defaultEncoder = new HttpUrlEncodingCodec();

export function serializeFormData(
    dataToBeSerialized: any,
    encoder: HttpParameterCodec = defaultEncoder,
): HttpParams | null {
    const fromSource = isObjectLike(dataToBeSerialized)
        ? { fromObject: dataToBeSerialized }
        : { fromString: dataToBeSerialized.toString() };

    return new HttpParams({ encoder, ...fromSource });
}
