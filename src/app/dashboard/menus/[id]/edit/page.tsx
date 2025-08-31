'use client';

import MenuForm from '@/components/menus/MenuForm';

export default function EditMenuPage({ params }: any) {
  const id = typeof params?.id === 'string' ? parseInt(params.id, 10) : NaN;
  return <MenuForm menuId={id} />;
}
