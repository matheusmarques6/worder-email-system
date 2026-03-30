'use client';

import type { BlockBase } from '@/lib/email-builder/types';
import { useEmailBuilderStore } from '@/lib/email-builder/store';
import { TextBlock } from './TextBlock';
import { ImageBlock } from './ImageBlock';
import { ButtonBlock } from './ButtonBlock';
import { DividerBlock } from './DividerBlock';
import { SpacerBlock } from './SpacerBlock';
import { HeadingBlock } from './HeadingBlock';
import { ColumnsBlock } from './ColumnsBlock';
import { HtmlBlock } from './HtmlBlock';
import { ProductBlock } from './ProductBlock';
import { CouponBlock } from './CouponBlock';
import { FooterBlock } from './FooterBlock';
import { SocialLinksBlock } from './SocialLinksBlock';
import { CountdownBlock } from './CountdownBlock';

const blockComponents: Record<string, React.ComponentType<{ data: Record<string, unknown>; blockId?: string }>> = {
  image: ImageBlock,
  button: ButtonBlock,
  divider: DividerBlock,
  spacer: SpacerBlock,
  heading: HeadingBlock,
  columns: ColumnsBlock,
  html: HtmlBlock,
  footer: FooterBlock,
  'social-links': SocialLinksBlock,
  product: ProductBlock,
  'product-grid': ProductBlock,
  'abandoned-cart': ProductBlock,
  coupon: CouponBlock,
  countdown: CountdownBlock,
};

// Block types that support isSelected prop
const textLikeTypes = new Set(['text', 'header']);

export function BlockRenderer({ block }: { block: BlockBase }) {
  const selectedBlockId = useEmailBuilderStore((s) => s.selectedBlockId);
  const isSelected = selectedBlockId === block.id;

  if (textLikeTypes.has(block.type)) {
    return (
      <TextBlock
        data={block.data}
        blockId={block.id}
        isSelected={isSelected}
      />
    );
  }

  const Component = blockComponents[block.type];
  if (!Component) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        Bloco &quot;{block.type}&quot; nao suportado
      </div>
    );
  }
  return <Component data={block.data} blockId={block.id} />;
}
