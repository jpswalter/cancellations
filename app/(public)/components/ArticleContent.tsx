// file: app/(public)/components/ArticleContent.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { getArticle } from '@/lib/api/article';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Props = {
  slug: string;
  articleCategory?: string;
  showCategory?: boolean;
  showContactBanner?: boolean;
};

const ArticleContent: FC<Props> = ({
  slug,
  articleCategory = 'CX Leader Resource',
  showCategory = true,
  showContactBanner = true,
}) => {
  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticle(slug),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;
  if (!article) notFound();

  const isPrivacyPolicy = slug === 'privacy-policy';

  return (
    <div className="py-8 md:py-20 mx-auto">
      {!isPrivacyPolicy && showCategory && (
        <p className="text-lg text-gray-500 mb-2">{articleCategory}</p>
      )}
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <div
        className="text-xl leading-9 hygraph-content"
        dangerouslySetInnerHTML={{ __html: article?.body?.html ?? '' }}
      />
      {showContactBanner && (
        <section className="text-center p-4 mt-10">
          <h2 className="text-4xl mb-10">Contact a ProxyLink representative</h2>
          <Link href="/schedule-demo">
            <Button color="blue">Get in touch</Button>
          </Link>
        </section>
      )}
    </div>
  );
};

export default ArticleContent;
