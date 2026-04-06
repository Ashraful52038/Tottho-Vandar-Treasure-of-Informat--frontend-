// utils/imageUtils.ts
export const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';

  console.log('imageUtils input:', imagePath);

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('imageUtils - already full URL:', imagePath);
    return imagePath;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const fullUrl = `${baseUrl}${cleanPath}`;

  console.log('imageUtils - generated full URL:', fullUrl);
  return fullUrl;
};