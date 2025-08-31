'use client';

import React from 'react';
import CollectionForm from '@/components/colecciones/CollectionForm';

export default function EditCollectionPage({ params }: { params: { id: string } }) {
  return <CollectionForm collectionId={parseInt(params.id)} />;
}