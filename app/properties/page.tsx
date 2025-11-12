import PropertySearchForm from '@/components/PropertySearchForm';
import PropertyCard from '@/components/PropertyCard';
import properties from '@/components/data/properties.json' // '@/components/Properties';

const PropertiesPage = async () => {
  return (
    <>
        <section className='bg-blue-700 py-4'>
          <div className='max-w-7xl mx-auto px-4 flex flex-col items-start sm:px-6 lg:px-8'>
            <PropertySearchForm />
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
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
