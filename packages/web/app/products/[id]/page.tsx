import type { Metadata } from 'next';
import { ProductDetail } from '@/components/products/ProductDetail';

export const metadata: Metadata = { title: 'Product Detail' };

interface Props {
  params: { id: string };
}

export default function ProductDetailPage({ params }: Props) {
  return <ProductDetail id={params.id} />;
}
