import { codegenaStorybookPreview } from '@codegena/ui-theme/storybook';

import { withAppBuildId } from './bootstrap';

export default {
  ...codegenaStorybookPreview,
  decorators: [...codegenaStorybookPreview.decorators, withAppBuildId],
};
