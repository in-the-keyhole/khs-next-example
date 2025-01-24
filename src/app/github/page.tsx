import { getGithubPageProps } from "@keyhole/controllers/PageController";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Keyhole Next | Github",
  description: "Welcome to Keyhole Next! A Next.js example for developers.",
};


export default async function GithubPage() {
  const { profile, events } = await getGithubPageProps();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex flex-col">
        <div>
          <h3 className="p-2 text-2xl font-bold text-center">{profile?.name}({profile?.login}) on Github</h3>
          <div className="flex flex-col gap-2">
            {profile?.location && <div>
              <strong>Location</strong>: {profile?.location}
            </div>}
            {profile?.html_url && <div>
              <a className="underline" href={profile.html_url} target="_blank">Github Profile Link</a>
            </div>}
          </div>
        </div>
        <div className="p-2 flex flex-col">
          <h3 className="p-2 text-2xl font-bold text-center">Recent Events</h3>
          <div className="overflow-y-scroll max-h-[calc(75vh-128px)] min-h-[320px]">
            <table>
              <thead>
                <tr>
                  <th>
                    Event Type
                  </th>
                  <th>
                    Repository
                  </th>
                  <th>
                    Commit Message
                  </th>
                  <th>
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event: {
                  id: string,
                  type: string;
                  repo: {name: string};
                  payload: {commits: [{ message: string }]};
                  created_at: string;
                }) => 
                  <tr key={event?.id}>
                    <td>
                      {event?.type}
                    </td>
                    <td>
                      {event?.repo?.name}
                    </td>
                    <td>
                      {event?.payload?.commits?.map((commit: { message: string }) => commit.message)?.join('; ')}
                    </td>
                    <td>
                      {event?.created_at}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
