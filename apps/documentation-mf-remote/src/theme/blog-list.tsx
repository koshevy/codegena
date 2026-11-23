import BlogLayout from '@docusaurus/theme-classic/lib/theme/BlogLayout';
import type OriginalBlogListPage from '@docusaurus/theme-classic/lib/theme/BlogListPage';
import BlogListPaginator from '@docusaurus/theme-classic/lib/theme/BlogListPaginator';
import BlogPostItems from '@docusaurus/theme-classic/lib/theme/BlogPostItems';
import { PageMetadata } from '@docusaurus/theme-common';
import type { ComponentProps, ReactElement } from 'react';

type BlogListProps = ComponentProps<typeof OriginalBlogListPage>;

export default function BlogList({
  items,
  metadata,
  sidebar,
}: BlogListProps): ReactElement {
  return (
    <BlogLayout sidebar={sidebar}>
      <PageMetadata
        description={metadata.blogDescription}
        title={metadata.blogTitle}
      />
      <h1>{metadata.blogTitle}</h1>
      <BlogPostItems items={items} />
      <BlogListPaginator metadata={metadata} />
    </BlogLayout>
  );
}
