import { CapabilityCard } from './CapabilityCard.js';

type TeamsResponse = {
  teams: Array<{ name: string; mascot?: string; members: string[] }>;
};

export default function Teams() {
  return <CapabilityCard<TeamsResponse>
    title="Teams"
    description="Manage teams and members."
    endpoint="/api/teams"
    emptyMessage="No teams yet."
    isEmpty={({ teams }) => teams.length === 0}
  >
    {({ teams }) => <ul aria-label="Teams">
      {teams.map((team) => <li key={team.name}>
        {team.name}{team.mascot ? ` (${team.mascot})` : ''} — {team.members.length} members
      </li>)}
    </ul>}
  </CapabilityCard>;
}
