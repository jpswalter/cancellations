import { getArticles } from '@/lib/api/article';
import { QueryClient } from '@tanstack/react-query';
import LandingPageContent from './components/LandingPageContent';

const LandingPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['articles'],
    queryFn: () => getArticles(),
  });

  return <LandingPageContent />;
};

export default LandingPage;
