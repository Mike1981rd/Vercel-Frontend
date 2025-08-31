'use client';

import NavigationMenuForm from '@/components/navigation-menus/NavigationMenuForm';

export default function EditNavigationMenuPage({ params }: any) {
  const menuId = parseInt(String(params?.id || 'NaN'), 10);

  return <NavigationMenuForm menuId={menuId} />;
}
