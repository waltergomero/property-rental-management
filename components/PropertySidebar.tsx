'use client';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButtons from '@/components/ShareButtons';
import PropertyContactForm from '@/components/PropertyContactForm';

const PropertySidebar = ({ property }: { property: any }) => {
  return (
    <aside className='space-y-4'>
      <BookmarkButton property={property} />
      <ShareButtons property={property} />
      <PropertyContactForm property={property} />
    </aside>
  );
};

export default PropertySidebar;
