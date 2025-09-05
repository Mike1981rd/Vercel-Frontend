'use client';

import React from 'react';
import CollectionForm from '@/components/colecciones/CollectionForm';

export default function EditCollectionPage({ params }: any) {
  const id = typeof params?.id === 'string' ? parseInt(params.id, 10) : NaN;
  return <CollectionForm collectionId={id} />;
}
