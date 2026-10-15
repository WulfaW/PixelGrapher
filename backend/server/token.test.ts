import { describe, it, expect, beforeAll } from 'vitest';
import { sealUser, unsealUser, TOKEN_TTL_MS } from './token';

beforeAll(() => { process.env.SESSION_SECRET = 'test-secret'; });

const user = { username: 'octo', accessToken: 'gho_secret' };

describe('sealed login tokens', () => {
  it('round-trips a user', () => {
    expect(unsealUser(sealUser(user))).toEqual(user);
  });

  it('does not expose the access token in the token text', () => {
    expect(Buffer.from(sealUser(user), 'base64url').toString('utf8')).not.toContain('gho_secret');
  });

  it('rejects a tampered token', () => {
    const t = sealUser(user);
    const bad = t.slice(0, -2) + (t.endsWith('AA') ? 'BB' : 'AA');
    expect(unsealUser(bad)).toBeNull();
  });

  it('rejects a token sealed with another secret', () => {
    const t = sealUser(user);
    process.env.SESSION_SECRET = 'other';
    expect(unsealUser(t)).toBeNull();
    process.env.SESSION_SECRET = 'test-secret';
  });

  it('rejects an expired token and garbage input', () => {
    const t = sealUser(user, 0);
    expect(unsealUser(t, TOKEN_TTL_MS + 1)).toBeNull();
    expect(unsealUser('not-a-token')).toBeNull();
  });
});
