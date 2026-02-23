import { PublicPageProps } from "@keyhole/lib/models/pageProps";
import { PageTemplate } from "@keyhole/lib/components/templates/page-template";
import { HeroSection } from "@keyhole/lib/components/organisms/hero-section";

export const HomePage = ({ name }: PublicPageProps) => (
  <PageTemplate>
    <HeroSection name={name} />
  </PageTemplate>
);