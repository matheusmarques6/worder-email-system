export type BlockType =
  | 'text' | 'image' | 'button' | 'divider' | 'spacer'
  | 'heading' | 'columns' | 'html' | 'header' | 'footer'
  | 'social-links' | 'product' | 'product-grid' | 'abandoned-cart'
  | 'coupon' | 'countdown' | 'video';

export interface DisplayCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_set';
  value: string;
}

export interface ConditionalBlockData {
  conditions: DisplayCondition[];
  logic: 'and' | 'or';
  showBlockIds: string[];
  hideBlockIds: string[];
}

export interface BlockBase {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  displayConditions?: {
    conditions: DisplayCondition[];
    logic: 'and' | 'or';
  };
}

export interface EmailTemplate {
  root: {
    type: 'EmailLayout';
    data: {
      backdropColor: string;
      canvasColor: string;
      textColor: string;
      fontFamily: string;
      childrenIds: string[];
      preheaderText: string;
      subject: string;
      width: number;
    };
  };
  blocks: Record<string, BlockBase>;
}

// Block data types for each block type
export interface TextBlockData {
  html: string;
  style: {
    color: string;
    fontSize: number;
    fontFamily: string;
    textAlign: 'left' | 'center' | 'right';
    lineHeight: number;
    padding: { top: number; bottom: number; left: number; right: number };
    backgroundColor?: string;
  };
}

export interface ImageBlockData {
  url: string;
  alt: string;
  linkHref?: string;
  width: number;
  alignment: 'left' | 'center' | 'right';
  borderRadius: number;
  padding: { top: number; bottom: number; left: number; right: number };
}

export interface ButtonBlockData {
  text: string;
  href: string;
  style: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    borderRadius: number;
    padding: { top: number; bottom: number; left: number; right: number };
    width: 'auto' | 'full';
    alignment: 'left' | 'center' | 'right';
  };
}

export interface DividerBlockData {
  style: {
    color: string;
    width: string;
    thickness: number;
    padding: { top: number; bottom: number };
  };
}

export interface SpacerBlockData {
  height: number;
}

export interface HeadingBlockData {
  text: string;
  level: 1 | 2 | 3;
  style: {
    color: string;
    fontSize: number;
    fontFamily: string;
    textAlign: 'left' | 'center' | 'right';
    padding: { top: number; bottom: number; left: number; right: number };
  };
}

export interface ColumnsBlockData {
  layout: '50-50' | '33-33-33' | '66-33' | '33-66';
  columns: Array<{
    width: string;
    childrenIds: string[];
    padding: { top: number; bottom: number; left: number; right: number };
  }>;
  mobileStack: boolean;
  gap: number;
}

export interface ProductBlockData {
  product?: {
    shopifyId: string;
    title: string;
    imageUrl: string;
    price: string;
    compareAtPrice?: string;
    productUrl: string;
  };
  showImage: boolean;
  showTitle: boolean;
  showPrice: boolean;
  showButton: boolean;
  buttonText: string;
  buttonStyle: ButtonBlockData['style'];
}

export interface CouponBlockData {
  type: 'static' | 'dynamic';
  staticCode?: string;
  dynamicTag?: string;
  headerText: string;
  style: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    borderStyle: 'solid' | 'dashed' | 'dotted';
    borderColor: string;
    borderRadius: number;
    padding: { top: number; bottom: number; left: number; right: number };
  };
}

export interface FooterBlockData {
  companyName: string;
  address: string;
  showUnsubscribe: boolean;
  textColor: string;
  linkColor: string;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
}

export interface SocialLinksBlockData {
  networks: Array<{
    type: 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'youtube' | 'whatsapp';
    url: string;
  }>;
  iconSize: 24 | 32 | 40;
  alignment: 'left' | 'center' | 'right';
}

export interface HtmlBlockData {
  html: string;
}

export interface CountdownBlockData {
  endDate: string; // ISO date
  style: 'light' | 'dark' | 'minimal';
  labels: { days: string; hours: string; minutes: string; seconds: string };
  expiredText: string;
  backgroundColor: string;
  numberColor: string;
  labelColor: string;
  padding: { top: number; bottom: number; left: number; right: number };
}

export interface VideoBlockData {
  videoUrl: string;
  thumbnailUrl: string;
  alt: string;
  width: number;
  padding: { top: number; bottom: number; left: number; right: number };
}

export interface ProductGridBlockData {
  products: Array<{
    shopifyId: string;
    title: string;
    imageUrl: string;
    price: string;
    compareAtPrice?: string;
    productUrl: string;
  }>;
  columns: 2 | 3;
  showImage: boolean;
  showTitle: boolean;
  showPrice: boolean;
  showButton: boolean;
  buttonText: string;
  buttonStyle: ButtonBlockData['style'];
}

export interface AbandonedCartBlockData {
  showImage: boolean;
  showTitle: boolean;
  showPrice: boolean;
  showQuantity: boolean;
  buttonText: string;
  buttonHref: string;
  buttonStyle: { backgroundColor: string; textColor: string; borderRadius: number };
  maxItems: number;
}

export interface HeaderBlockData {
  logoUrl: string;
  logoWidth: number;
  logoLinkHref: string;
  links: Array<{ text: string; href: string }>;
  layout: 'logo-left' | 'logo-center';
  backgroundColor: string;
  linkColor: string;
  padding: { top: number; bottom: number; left: number; right: number };
}

// Editor state
export interface EditorState {
  template: EmailTemplate;
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  isDragging: boolean;
  previewMode: 'edit' | 'desktop' | 'mobile';
  history: EmailTemplate[];
  historyIndex: number;
  isDirty: boolean;
}
