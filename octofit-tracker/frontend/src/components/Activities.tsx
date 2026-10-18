import { CapabilityCard } from './CapabilityCard.js';

type ActivitiesResponse = {
  activities: Array<{ type: string; minutes: number; points: number }>;
};

export default function Activities() {
  return <CapabilityCard<ActivitiesResponse>
    title="Activities"
    description="Track student activity minutes and points."
    endpoint="/api/activities"
    emptyMessage="No activities yet."
    isEmpty={({ activities }) => activities.length === 0}
  >
    {({ activities }) => <ul aria-label="Activities">
      {activities.map((activity, index) => <li key={`${activity.type}-${index}`}>
        {activity.type}: {activity.minutes} minutes, {activity.points} points
      </li>)}
    </ul>}
  </CapabilityCard>;
}
