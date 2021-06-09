import { Contact } from './contact';
import { License } from './license';

/**
 * @see https://swagger.io/specification/#infoObject
 */
export interface Info {
    contact?: Contact;
    description?: string;
    license?: License;
    termsOfService?: string;
    title: string;
    version: string;
}
