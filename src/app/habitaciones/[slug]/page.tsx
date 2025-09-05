import { notFound } from 'next/navigation';
import PreviewPage from '@/components/preview/PreviewPage';
import { PageType } from '@/types/editor.types';

interface RoomPageProps {
  params: {
    slug: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const { slug } = params;
  
  // Pass the room slug to PreviewPage
  // PreviewPage will handle loading the specific room data
  return <PreviewPage pageType={PageType.CUSTOM} handle="habitaciones" roomSlug={slug} />;
}

// This function will be called at build time to generate static pages
export async function generateStaticParams() {
  try {
    // Fetch all rooms to pre-generate their pages
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/rooms/company/1/public`);
    
    if (!response.ok) {
      console.error('Failed to fetch rooms for static generation');
      return [];
    }
    
    const rooms = await response.json();
    
    // Generate params for each room using their slug
    return rooms
      .filter((room: any) => room.slug) // Only rooms with slugs
      .map((room: any) => ({
        slug: room.slug,
      }));
  } catch (error) {
    console.error('Error generating static params for rooms:', error);
    return [];
  }
}