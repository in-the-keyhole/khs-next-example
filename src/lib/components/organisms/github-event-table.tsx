import { SectionHeading } from "@keyhole/lib/components/atoms/section-heading";
import { GithubEvent } from "@keyhole/lib/models/pageProps";

export const GithubEventTable = ({ events }: { events: GithubEvent[] }) => (
  <div className="p-2 flex flex-col">
    <SectionHeading>Recent Events</SectionHeading>
    <div className="overflow-y-scroll max-h-[calc(75vh-128px)] min-h-[320px]">
      <table>
        <thead>
          <tr>
            <th>Event Type</th>
            <th>Repository</th>
            <th>Commit Message</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.type}</td>
              <td>{event.repo?.name}</td>
              <td>{event.payload?.commits?.map((c) => c.message).join('; ')}</td>
              <td>{event.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
