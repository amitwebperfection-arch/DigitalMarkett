import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cmsService } from '../../services/cms.service';
import LoadingSpinner from '../../components/common/LoadingSpinner'; 

function PublicCmsPage() {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['cms', slug],
    queryFn: () => cmsService.getPageBySlug(slug),
  });

  if (isLoading) return <LoadingSpinner fullScreen />; 
  if (!data?.data?.page) return <div>Page not found</div>;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">{data.data.page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: data.data.page.content }} />
    </div>
  );
}

export default PublicCmsPage;