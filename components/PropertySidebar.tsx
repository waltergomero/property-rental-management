'use client';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButtons from '@/components/ShareButtons';
import PropertyContactForm from '@/components/PropertyContactForm';
import { IProperty } from '@/types/property';

const PropertySidebar = ({ property }: { property: IProperty }) => {
  return (
    <aside className='space-y-4'>
      <BookmarkButton property={property} />
      <ShareButtons property={property} />
      <PropertyContactForm property={property} />
    </aside>
  );
};

export default PropertySidebar;
