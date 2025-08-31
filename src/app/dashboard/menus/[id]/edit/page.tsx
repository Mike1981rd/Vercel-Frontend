'use client';

import MenuForm from '@/components/menus/MenuForm';

interface Props {
  params: {
    id: string;
  };
}

export default function EditMenuPage({ params }: Props) {
  return <MenuForm menuId={parseInt(params.id)} />;
}