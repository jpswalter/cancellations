// app/(public)/article/[slug]/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import ArticleContent from '../../components/ArticleContent';
import { getArticle } from '@/lib/api/article';

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['article', params.slug],
    queryFn: () => getArticle(params.slug),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArticleContent
        slug={params.slug}
        showCategory={params.slug !== 'terms-and-conditions'}
      />
    </HydrationBoundary>
  );
}
