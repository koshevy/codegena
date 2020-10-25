import { Response } from './response';

export interface ResponseMap {
    /**
     * Default case, when needed status is not described.
     * Usually describe error answers.
     */
    default?: Response;

    // Possible codes
    '100'?: Response;
    '101'?: Response;
    '102'?: Response;
    '200'?: Response;
    '201'?: Response;
    '202'?: Response;
    '203'?: Response;
    '204'?: Response;
    '205'?: Response;
    '206'?: Response;
    '207'?: Response;
    '208'?: Response;
    '226'?: Response;
    '300'?: Response;
    '301'?: Response;
    '302'?: Response;
    '303'?: Response;
    '304'?: Response;
    '305'?: Response;
    '306'?: Response;
    '307'?: Response;
    '308'?: Response;
    '400'?: Response;
    '401'?: Response;
    '402'?: Response;
    '403'?: Response;
    '404'?: Response;
    '405'?: Response;
    '406'?: Response;
    '407'?: Response;
    '408'?: Response;
    '409'?: Response;
    '410'?: Response;
    '411'?: Response;
    '412'?: Response;
    '413'?: Response;
    '414'?: Response;
    '415'?: Response;
    '416'?: Response;
    '417'?: Response;
    '418'?: Response;
    '419'?: Response;
    '421'?: Response;
    '422'?: Response;
    '423'?: Response;
    '424'?: Response;
    '426'?: Response;
    '428'?: Response;
    '429'?: Response;
    '431'?: Response;
    '449'?: Response;
    '451'?: Response;
    '499'?: Response;
    '501'?: Response;
    '502'?: Response;
    '503'?: Response;
    '504'?: Response;
    '505'?: Response;
    '506'?: Response;
    '507'?: Response;
    '508'?: Response;
    '509'?: Response;
    '510'?: Response;
    '511'?: Response;
    '520'?: Response;
    '521'?: Response;
    '522'?: Response;
    '523'?: Response;
    '524'?: Response;
    '525'?: Response;
    '526'?: Response;
}
