// todo describe the JsonSCHEMA type
export interface SubSchema {
    [key: string]: any;
}

export interface ApiSchema {
    request: SubSchema | null;
    response: SubSchema | null;
    params: SubSchema | null;
}
