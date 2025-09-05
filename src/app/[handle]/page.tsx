import { notFound } from 'next/navigation';
import PreviewPage from '@/components/preview/PreviewPage';
import CustomPageView from '@/components/preview/CustomPageView';
import { PageType } from '@/types/editor.types';

// Valid page handles that map to PageType enum
// Include common aliases used by the editor buttons
const validHandles: Record<string, PageType> = {
  'home': PageType.HOME,
  'product': PageType.PRODUCT,
  'cart': PageType.CART,
  'checkout': PageType.CHECKOUT,
  'collection': PageType.COLLECTION,
  'all_collections': PageType.ALL_COLLECTIONS,
  'all-collections': PageType.ALL_COLLECTIONS, // alias with hyphen
  'all_products': PageType.ALL_PRODUCTS,
  'all-products': PageType.ALL_PRODUCTS, // alias with hyphen
  'custom': PageType.CUSTOM,
  'habitaciones': PageType.CUSTOM
};

interface PageProps {
  params: {
    handle: string;
  };
}

export default function Page({ params }: PageProps) {
  const { handle } = params;
  
  // Check if handle is valid for Website Builder pages
  const pageType = validHandles[handle];
  if (pageType) {
    return <PreviewPage pageType={pageType} handle={handle} />;
  }

  // If not a Website Builder page, try to load as custom page/policy
  return <CustomPageView slug={handle} />;
}

// Generate static params for known pages
export async function generateStaticParams() {
  return Object.keys(validHandles).map((handle) => ({
    handle,
  }));
}