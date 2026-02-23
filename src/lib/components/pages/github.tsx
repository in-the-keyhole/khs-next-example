import { GithubPageProps } from "@keyhole/lib/models/pageProps";
import { PageTemplate } from "@keyhole/lib/components/templates/page-template";
import { GithubProfile } from "@keyhole/lib/components/organisms/github-profile";
import { GithubEventTable } from "@keyhole/lib/components/organisms/github-event-table";

export const GithubPage = ({ profile, events }: GithubPageProps) => (
  <PageTemplate>
    <GithubProfile
      name={profile?.name}
      login={profile?.login}
      location={profile?.location}
      html_url={profile?.html_url}
    />
    <GithubEventTable events={events} />
  </PageTemplate>
);
