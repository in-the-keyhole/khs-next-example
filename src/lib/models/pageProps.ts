export interface PublicPageProps {
    name?: string;
}

export interface PrivatePageProps {
    name?: string;
}

export interface GithubPageProps {
    profile: any;
    events: GithubEvent[];
}

export interface GithubEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: { commits: { message: string }[] };
  created_at: string;
}