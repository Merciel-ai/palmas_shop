// Global image URL helper - USE THIS IN ALL COMPONENTS
const API_URL = import.meta.env.VITE_API_URL || 'https://palmas-api-jhip.onrender.com';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  
  // If it's a localhost URL, replace with production URL
  if (imagePath.includes('localhost:5000')) {
    return imagePath.replace('http://localhost:5000', API_URL);
  }
  
  // If it's already a full HTTPS URL, return it
  if (imagePath.startsWith('https://')) return imagePath;
  
  // If it's a relative path, prepend the API URL
  if (imagePath.startsWith('/uploads/')) {
    return `${API_URL}${imagePath}`;
  }
  
  return imagePath;
};

// Image component with automatic error handling
export const SafeImage = ({ src, alt, className, ...props }) => {
  const [imgSrc, setImgSrc] = React.useState(getImageUrl(src));
  
  const handleError = () => {
    setImgSrc('/placeholder-image.jpg');
  };
  
  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      onError={handleError}
      className={className}
      {...props}
    />
  );
};
