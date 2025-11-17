import PropertySearchForm from '@/components/PropertySearchForm';
import PropertyCard from '@/components/PropertyCard';
import { fetchProperties } from '@/actions/properties';
import { Fragment } from 'react/jsx-runtime';

const PropertiesPage = async () => {
  const { properties } = await fetchProperties();
  return (
    <Fragment>
        <section className='bg-blue-700 py-4'>
          <div className='max-w-7xl mx-auto px-4 flex flex-col items-start sm:px-6 lg:px-8'>
            <PropertySearchForm />
          </div>
        </section>
        <section className='px-4 py-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {properties.map((property, index) => (
                  <PropertyCard key={index} property={property as any} />
              ))}
            </div>
        </section>
    </Fragment>
  );
};
export default PropertiesPage;
