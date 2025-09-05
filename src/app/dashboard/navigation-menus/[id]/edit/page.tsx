'use client';

import { use } from 'react';
import NavigationMenuForm from '@/components/navigation-menus/NavigationMenuForm';

interface PageParams {
  params: Promise<{
    id: string;
  }>;
}

export default function EditNavigationMenuPage({ params }: PageParams) {
  const resolvedParams = use(params);
  const menuId = parseInt(String(resolvedParams?.id || 'NaN'), 10);

  return <NavigationMenuForm menuId={menuId} />;
}
