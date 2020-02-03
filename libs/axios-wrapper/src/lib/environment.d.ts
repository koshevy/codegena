declare interface CodegenaAxiosWrapperEnvironment {
    doNotValidateRequest?: boolean;
    doNotValidateResponse?: boolean;
    doNotValidateParameters?: boolean;
    redefineBaseUrl?: string | {
        [srcBaseUrl: string]: string
    }

    [otherItem: string]: string;
}

declare const environment: CodegenaAxiosWrapperEnvironment;
