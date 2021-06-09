import { Facade } from './facade';
import { DummyFileSavingStrategy } from './stubs/dummy-file-saving-strategy';
const complexOAS3Specification = require('./schemas/complex.json');

describe('Facade', () => {
    it('should be created', () => {
        const strategy = new DummyFileSavingStrategy();
        const facade = new Facade(complexOAS3Specification, strategy);
        facade.commit();
    });
});
