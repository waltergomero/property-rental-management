import PropertyAddForm from '@/components/PropertyAddForm';

const PropertyAddPage = () => {
  return (
    <section className='bg-blue-50'>
      <div className='container m-auto  py-10'>
        <h2 className='text-2xl text-center font-semibold mb-6'>
          Add Property
        </h2>
        <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-md border border-gray-200 m-4 md:m-0'>
          
          <PropertyAddForm />
        </div>
      </div>
    </section>
  );
};
export default PropertyAddPage;
