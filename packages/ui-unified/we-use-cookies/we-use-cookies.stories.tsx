import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';

import { useSavedUserAcception } from './use-saved-user-acception';
import { WeUseCookies } from './we-use-cookies';
import type { WeUseCookiesProps } from './we-use-cookies.props';

function CookieNoticeExample(props: WeUseCookiesProps): ReactElement {
  const choice = useSavedUserAcception();

  return (
    <>
      <p
        aria-label="Saved cookie choice"
        role="status"
      >
        {choice ?? 'No decision'}
      </p>
      <WeUseCookies {...props} />
    </>
  );
}

const meta: Meta<typeof WeUseCookies> = {
  args: {
    privacyPolicyHref: '#privacy',
    repoLink: 'https://github.com/koshevy/codegena',
  },
  component: WeUseCookies,
  render: (args) => <CookieNoticeExample {...args} />,
  title: 'Codegena/Unified UI/We Use Cookies',
};

export default meta;

export const Notice: StoryObj<typeof WeUseCookies> = {};

export const CustomExit: StoryObj<typeof WeUseCookies> = {
  args: { rickNRollLink: '#leave' },
};

export const Dark: StoryObj<typeof WeUseCookies> = {
  parameters: { codegenaTheme: 'dark' },
};
