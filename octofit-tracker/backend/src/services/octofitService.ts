import { Activity, Team, User, Workout } from '../models/index.js';

type Input = Record<string, unknown>;

function isInput(value: unknown): value is Input {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function badRequest(message: string): Error & { status: number } {
  return Object.assign(new Error(message), { status: 400 });
}

function notFound(message: string): Error & { status: number } {
  return Object.assign(new Error(message), { status: 404 });
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[\da-f]{24}$/i.test(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isInput(input)) throw badRequest('Activity details are required');
  const { userId, teamId, type, minutes } = input;
  if (!isObjectId(userId) || !isObjectId(teamId)) throw badRequest('Valid userId and teamId are required');
  if (typeof type !== 'string' || !type.trim()) throw badRequest('Activity type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw badRequest('Activity minutes must be a positive number');
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user) throw notFound('User not found');
  if (!team) throw notFound('Team not found');

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isInput(input)) throw badRequest('Team details are required');
  const { name, mascot } = input;
  const submittedMembers = input.members === undefined ? [] : input.members;
  if (typeof name !== 'string' || !name.trim()) throw badRequest('Team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw badRequest('Team mascot is required');
  if (!Array.isArray(submittedMembers) || !submittedMembers.every(isObjectId)) {
    throw badRequest('Team members must be valid user IDs');
  }

  const memberIds = [...new Set(submittedMembers)];
  const members = await User.find({ _id: { $in: memberIds } }).select('_id').lean();
  if (members.length !== memberIds.length) throw notFound('One or more team members were not found');

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: unknown; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [String(_id), totalPoints]));

  return teams
    .map(({ _id, name }) => ({ teamName: name, totalPoints: pointsByTeam.get(_id.toString()) ?? 0 }))
    .sort((first, second) => second.totalPoints - first.totalPoints || first.teamName.localeCompare(second.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

function focusForActivity(type: string): string {
  const activity = type.toLowerCase();
  if (/run|walk|cycle|swim|cardio/.test(activity)) return 'endurance';
  if (/strength|weight|resistance/.test(activity)) return 'strength';
  if (/yoga|stretch|mobility/.test(activity)) return 'mobility';
  return activity;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw notFound('User not found');

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean(),
    Workout.find().lean(),
  ]);
  if (workouts.length === 0) return [];

  const goal = user.fitnessGoal.trim().toLowerCase();
  const activity = activities[0];
  const recentFocus = activity ? focusForActivity(activity.type) : undefined;
  const recommended = workouts.find((workout) => workout.focus.toLowerCase() === goal)
    ?? (recentFocus ? workouts.find((workout) => workout.focus.toLowerCase() === recentFocus) : undefined)
    ?? workouts[0];
  const ordered = [recommended, ...workouts.filter((workout) => workout._id.toString() !== recommended._id.toString())];
  const reason = recommended.focus.toLowerCase() === goal
    ? `Recommended to support your ${user.fitnessGoal} goal.`
    : activity
      ? `Recommended based on your recent ${activity.type} activity.`
      : `Suggested as a general ${recommended.focus} workout.`;

  return ordered.map((workout) => ({ ...workout, reason }));
}

export { User };
