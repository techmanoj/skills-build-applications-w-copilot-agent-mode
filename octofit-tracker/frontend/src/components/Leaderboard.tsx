import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardResponse = {
  leaderboard: Array<{ teamName: string; totalPoints: number; rank: number }>;
};

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardResponse>
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    emptyMessage="No rankings yet."
    isEmpty={({ leaderboard }) => leaderboard.length === 0}
  >
    {({ leaderboard }) => <ol aria-label="Leaderboard">
      {leaderboard.map((team) => <li key={team.teamName}>
        {team.teamName}: {team.totalPoints} points (rank {team.rank})
      </li>)}
    </ol>}
  </CapabilityCard>;
}
