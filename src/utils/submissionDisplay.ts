import type { Submission } from '@/types/submission';

export interface SubmissionDisplayField {
  label: string;
  value: string;
}

const TEAM_SETUP_LABELS: Record<string, string> = {
  solo: 'Solo Project',
  pair: 'Pair (2 people)',
  team: 'Team (3-5 people)',
};

export function formatCaseProjectFields(submission: Submission): SubmissionDisplayField[] {
  const payload = (submission.payload ?? {}) as any;
  const fields: SubmissionDisplayField[] = [];

  const teamSetup = submission.team_setup ?? payload.teamSetup;
  if (teamSetup) {
    fields.push({
      label: 'Team Setup',
      value: TEAM_SETUP_LABELS[teamSetup] ?? String(teamSetup),
    });
  }

  const goal = payload.goal;
  if (typeof goal === 'string' && goal.trim().length > 0) {
    fields.push({
      label: 'Goal',
      value: goal.trim(),
    });
  }

  return fields;
}

export function formatInternshipApplicationFields(submission: Submission): SubmissionDisplayField[] {
  const payload = (submission.payload ?? {}) as any;
  const fields: SubmissionDisplayField[] = [];

  const fullName = payload.fullName || submission.submitter_name;
  if (fullName) {
    fields.push({ label: 'Full Name', value: String(fullName) });
  }

  const email = payload.email || submission.submitter_email;
  if (email) {
    fields.push({ label: 'Email', value: String(email) });
  }

  const university = payload.university;
  if (university) {
    fields.push({ label: 'University & Major', value: String(university) });
  }

  const url = payload.url;
  if (url) {
    fields.push({ label: 'Portfolio / LinkedIn URL', value: String(url) });
  }

  const why = payload.why;
  if (why) {
    fields.push({ label: 'Why are you interested?', value: String(why) });
  }

  return fields;
}

export function formatProgramApplicationFields(submission: Submission): SubmissionDisplayField[] {
  const payload = (submission.payload ?? {}) as any;
  const fields: SubmissionDisplayField[] = [];

  const fullName = payload.fullName || submission.submitter_name;
  if (fullName) {
    fields.push({ label: 'Full Name', value: String(fullName) });
  }

  const email = payload.email || submission.submitter_email;
  if (email) {
    fields.push({ label: 'Email', value: String(email) });
  }

  const university = payload.university;
  if (university) {
    fields.push({ label: 'University & Year', value: String(university) });
  }

  const statement = payload.statement;
  if (statement) {
    fields.push({ label: 'Statement of Interest', value: String(statement) });
  }

  return fields;
}


