import { SectionHeading } from "@keyhole/lib/components/atoms/section-heading";
import { ExternalLink } from "@keyhole/lib/components/atoms/external-link";

export interface GithubProfileProps {
  name?: string;
  login?: string;
  location?: string;
  html_url?: string;
}

export const GithubProfile = ({ name, login, location, html_url }: GithubProfileProps) => (
  <div>
    <SectionHeading>{name}({login}) on Github</SectionHeading>
    <div className="flex flex-col gap-2">
      {location && (
        <div>
          <strong>Location</strong>: {location}
        </div>
      )}
      {html_url && (
        <div>
          <ExternalLink href={html_url}>Github Profile Link</ExternalLink>
        </div>
      )}
    </div>
  </div>
);
