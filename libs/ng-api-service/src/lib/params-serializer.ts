import {
    HttpParams,
    HttpUrlEncodingCodec
} from '@angular/common/http';

export function serializeToParams(dataToBeSerialized: any): HttpParams {
    const fromSource = ('object' === typeof dataToBeSerialized)
        ? { fromObject: dataToBeSerialized }
        : { fromString: dataToBeSerialized.toString() };

    return new HttpParams({
        // todo make it replacable
        encoder: new HttpUrlEncodingCodec(),
        ...fromSource
    });
}
