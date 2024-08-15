// file: app/(public)/components/ArticleContent.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { getArticle } from '@/lib/api/article';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const ArticleContent: FC<{ slug: string }> = ({ slug }) => {
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

  return (
    <div className="py-8 md:py-20 mx-auto">
      <p className="text-lg text-gray-500 mb-2">CX Leader Resource</p>
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <div
        className="text-xl leading-9"
        dangerouslySetInnerHTML={{ __html: article?.body?.html ?? '' }}
      />
    </div>
  );
};

export default ArticleContent;
