// file: lib/api/article.ts
type Article = {
  title: string;
  slug: string;
  body: {
    html: string;
  };
};

export async function getArticles(): Promise<Article[]> {
  const response = await fetch(process.env.NEXT_PUBLIC_HYGRAPH_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `query Articles {
        articles {
          title
          slug
          body {
            text
          }
        }
      }`,
    }),
  });
  const json = await response.json();
  return json.data.articles;
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!process.env.NEXT_PUBLIC_HYGRAPH_URL) {
    throw new Error('NEXT_PUBLIC_HYGRAPH_URL is not set');
  }
  const response = await fetch(process.env.NEXT_PUBLIC_HYGRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `query Article($slug:String!) {
        article(where: { slug: $slug }) {
          title
          slug
          body {
            html
          }
        }
      }`,
      variables: { slug },
    }),
  });
  const json = await response.json();
  return json.data.article;
}
