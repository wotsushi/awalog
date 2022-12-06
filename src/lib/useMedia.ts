export const Media = {
  Mobile: 'Mobile',
  Tablet: 'Tablet',
  PC: 'PC',
} as const;

export type MediaValue = typeof Media[keyof typeof Media];

export const useMedia = () => {
  const width = window.innerWidth;
  if (width > 1366) {
    return Media.PC;
  } else if (width >= 1024) {
    return Media.Tablet;
  }
  return Media.Mobile;
};
