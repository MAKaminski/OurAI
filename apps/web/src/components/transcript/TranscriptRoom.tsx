import { EventStream } from './EventStream';
import { Composer } from './Composer';
import { PresenceBar } from './PresenceBar';
import { ActAsRoleDropdown } from './ActAsRoleDropdown';

/** The live transcript room: stream + presence + composer + act-as dropdown. */
export function TranscriptRoom({ sessionId }: { sessionId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PresenceBar sessionId={sessionId} />
        <ActAsRoleDropdown />
      </div>
      <EventStream />
      <Composer />
    </div>
  );
}
