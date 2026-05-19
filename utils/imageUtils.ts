export const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';

  // যদি ইতিমধ্যে ফুল URL হয়
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // ব্যাকএন্ড URL (API URL না, শুধু ব্যাকএন্ড)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  
  // clean path
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const fullUrl = `${backendUrl}${cleanPath}`;
  
  console.log('getFullImageUrl - input:', imagePath);
  console.log('getFullImageUrl - output:', fullUrl);
  
  return fullUrl;
};