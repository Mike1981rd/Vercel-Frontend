'use client';

import NavigationMenuForm from '@/components/navigation-menus/NavigationMenuForm';

interface PageProps {
  params: { id: string };
}

export default function EditNavigationMenuPage({ params }: PageProps) {
  const menuId = parseInt(params.id);

  return <NavigationMenuForm menuId={menuId} />;
}