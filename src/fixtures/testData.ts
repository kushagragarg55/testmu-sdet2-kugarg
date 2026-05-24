import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '..', '..', 'test-data');

function load<T>(file: string): T {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
  return JSON.parse(raw) as T;
}

export interface InvalidLoginCase {
  description: string;
  email: string;
  password: string;
  expectedError: string;
}

export interface InvalidPayloadCase {
  description: string;
  payload: Record<string, unknown>;
  expectedStatuses: number[];
}

export const testData = {
  invalidLogins: () => load<InvalidLoginCase[]>('invalid-logins.json'),
  invalidProjectPayloads: () => load<InvalidPayloadCase[]>('invalid-payloads.json'),
  sampleProjects: () => load<{ name: string; description: string }[]>('projects.json'),
};
