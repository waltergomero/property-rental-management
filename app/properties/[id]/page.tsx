import Link from 'next/link';
import { Suspense } from 'react';
import { fetchPropertyById } from '@/actions/properties';
import PropertyHeaderImage from '@/components/PropertyHeaderImage';
import PropertyDetails from '@/components/PropertyDetails';
import PropertyImages from '@/components/PropertyImages';
import PropertySidebar from '@/components/PropertySidebar';
import { FaArrowLeft } from 'react-icons/fa';
import Spinner from '@/components/Spinner';

const PropertyPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const property = await fetchPropertyById(id);

  if (!property) {
    return (
      <h1 className='text-center text-2xl font-bold mt-10'>
        Property Not Found
      </h1>
    );
  }

  return (
    <Suspense fallback={<Spinner loading={true} />}>
      <PropertyHeaderImage image={property.images?.[0] || ''} />
      <section>
        <div className='container m-auto py-6 px-6'>
          <Link
            href='/properties'
            className='text-blue-500 hover:text-blue-600 flex items-center'
          >
            <FaArrowLeft className='mr-2' /> Back to Properties
          </Link>
        </div>
      </section>

      <section className='bg-blue-50'>
        <div className='container m-auto py-10'>
          <div className='grid grid-cols-1 md:grid-cols-[70%_30%] w-full gap-6'>
            <PropertyDetails property={property} />
            <PropertySidebar property={property} />
          </div>
        </div>
      </section>
      <PropertyImages images={property.images || []} />
    </Suspense>
  );
};
export default PropertyPage;
