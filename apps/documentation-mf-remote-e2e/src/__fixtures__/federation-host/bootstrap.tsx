import { createRoot } from 'react-dom/client';

import { Host } from './host';

const root = document.getElementById('root');

if (!root) {
  throw new Error('The federation fixture needs a root element.');
}

createRoot(root).render(<Host />);
