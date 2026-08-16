import * as git from 'isomorphic-git';
import { Volume } from 'memfs';

async function run() {
  const fs = Volume.fromJSON({});
  await git.init({ fs, dir: '/repo', defaultBranch: 'main' });
  
  const start = Date.now();
  for (let i = 0; i < 2000; i++) {
    fs.writeFileSync('/repo/test.txt', `commit ${i}`);
    await git.add({ fs, dir: '/repo', filepath: 'test.txt' });
    await git.commit({
      fs,
      dir: '/repo',
      author: { name: 'test', email: 'test@test.com', timestamp: 1234567890, timezoneOffset: 0 },
      message: `commit ${i}`
    });
  }
  const end = Date.now();
  console.log(`2000 commits took ${end - start} ms`);
}

run().catch(console.error);
