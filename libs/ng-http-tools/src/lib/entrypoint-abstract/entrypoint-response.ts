import { Observable } from "rxjs";
import { HttpEvent, HttpResponse, HttpErrorResponse } from "@angular/common/http";

export type EntrypointResponse<TResponse> = Observable<
    HttpEvent<TResponse> | HttpErrorResponse
>;
