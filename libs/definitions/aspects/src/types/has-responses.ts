export interface HasResponses<TResponse = unknown> {
    /**
     * Default case, when needed status is not described.
     * Usually describe error answers.
     */
    default?: TResponse;

    // Possible codes
    100?: TResponse;
    101?: TResponse;
    102?: TResponse;
    200?: TResponse;
    201?: TResponse;
    202?: TResponse;
    203?: TResponse;
    204?: TResponse;
    205?: TResponse;
    206?: TResponse;
    207?: TResponse;
    208?: TResponse;
    226?: TResponse;
    300?: TResponse;
    301?: TResponse;
    302?: TResponse;
    303?: TResponse;
    304?: TResponse;
    305?: TResponse;
    306?: TResponse;
    307?: TResponse;
    308?: TResponse;
    400?: TResponse;
    401?: TResponse;
    402?: TResponse;
    403?: TResponse;
    404?: TResponse;
    405?: TResponse;
    406?: TResponse;
    407?: TResponse;
    408?: TResponse;
    409?: TResponse;
    410?: TResponse;
    411?: TResponse;
    412?: TResponse;
    413?: TResponse;
    414?: TResponse;
    415?: TResponse;
    416?: TResponse;
    417?: TResponse;
    418?: TResponse;
    419?: TResponse;
    421?: TResponse;
    422?: TResponse;
    423?: TResponse;
    424?: TResponse;
    426?: TResponse;
    428?: TResponse;
    429?: TResponse;
    431?: TResponse;
    449?: TResponse;
    451?: TResponse;
    499?: TResponse;
    500?: TResponse;
    501?: TResponse;
    502?: TResponse;
    503?: TResponse;
    504?: TResponse;
    505?: TResponse;
    506?: TResponse;
    507?: TResponse;
    508?: TResponse;
    509?: TResponse;
    510?: TResponse;
    511?: TResponse;
    520?: TResponse;
    521?: TResponse;
    522?: TResponse;
    523?: TResponse;
    524?: TResponse;
    525?: TResponse;
    526?: TResponse;
}
