import { CapabilityCard } from './CapabilityCard.js';

type WorkoutsResponse = {
  suggestions: Array<{ title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string }>;
};

export default function Workouts() {
  const userEmail = 'mona@example.com';

  return <CapabilityCard<WorkoutsResponse>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint={`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`}
    emptyMessage="No workout suggestions available."
    isEmpty={({ suggestions }) => suggestions.length === 0}
  >
    {({ suggestions }) => <ul aria-label="Workout suggestions">
      {suggestions.map((workout) => <li key={workout.title}>
        <strong>{workout.title}</strong>
        {workout.focus ? ` — ${workout.focus}` : ''}
        {workout.minutes ? `, ${workout.minutes} minutes` : ''}
        {workout.difficulty ? ` (${workout.difficulty})` : ''}
        {workout.reason ? <p>{workout.reason}</p> : null}
      </li>)}
    </ul>}
  </CapabilityCard>;
}
