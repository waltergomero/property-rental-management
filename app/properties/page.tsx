import PropertySearchForm from '@/components/PropertySearchForm';
import PropertyCard from '@/components/PropertyCard';
import properties from '@/components/data/properties.json' // '@/components/Properties';

const PropertiesPage = async () => {
  return (
    <>
        <section className='bg-blue-700 py-4'>
          <div className='max-w-7xl mx-auto px-4 flex flex-col items-start sm:px-6 lg:px-8'>
            <PropertySearchForm />
          </div>
        </section>
        <section className='px-4 py-6'>
          <div className='container-xl lg:container m-auto px-4 py-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </div>
        </section>

      {/* <section className='bg-blue-700 py-4'>
        <div className='max-w-7xl mx-auto px-4 flex flex-col items-start sm:px-6 lg:px-8'>
          <PropertySearchForm />
        </div>
      </section>
      <Properties /> */}
    </>
  );
};
export default PropertiesPage;
