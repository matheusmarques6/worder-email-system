export interface BrandKit {
  id: string;
  storeId: string;
  logo: { url: string; width: number };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    canvas: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  buttons: {
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
  };
  footer: {
    companyName: string;
    address: string;
  };
}

export const DEFAULT_BRAND_KIT: BrandKit = {
  id: '',
  storeId: '',
  logo: { url: '', width: 150 },
  colors: {
    primary: '#F26B2A',
    secondary: '#F5A623',
    text: '#333333',
    background: '#FAFAFA',
    canvas: '#FFFFFF',
  },
  fonts: {
    heading: 'Arial, Helvetica, sans-serif',
    body: 'Arial, Helvetica, sans-serif',
  },
  buttons: {
    backgroundColor: '#F26B2A',
    textColor: '#FFFFFF',
    borderRadius: 4,
  },
  footer: {
    companyName: '',
    address: '',
  },
};

export const WEB_SAFE_FONTS = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Lucida Console', value: '"Lucida Console", Monaco, monospace' },
  { label: 'Palatino', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
  { label: 'Garamond', value: 'Garamond, serif' },
];
