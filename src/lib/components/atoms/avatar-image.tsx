import Image from 'next/image';

interface AvatarImageProps {
  src: string;
  alt: string;
  size?: number;
}

export const AvatarImage = ({ src, alt, size = 48 }: AvatarImageProps) => (
  <Image className="rounded-full" src={src} alt={alt} height={size} width={size} />
);
