import Image from 'next/image';

interface HeroSectionProps {
  name?: string;
}

export const HeroSection = ({ name }: HeroSectionProps) => (
  <>
    <Image src="/keyhole.svg" alt="Keyhole Logo" width={480} height={192} priority />
    <h1 className="p-2 text-3xl font-bold text-center">
      Welcome to Keyhole Next{name && `, ${name}`}!
    </h1>
    <p className="text-center mt-4">A Next.js example for developers.</p>
  </>
);
