const request = require('supertest');
const app = require('../server');

async function run() {
  console.log('Running basic API tests...');

  // ping
  const ping = await request(app).get('/api/ping');
  console.log('/api/ping ->', ping.status, ping.body.ok ? 'OK' : 'FAIL');

  // analytics
  const an = await request(app).get('/api/analytics');
  console.log('/api/analytics ->', an.status, an.body.ok ? 'OK' : 'FAIL');

  // classify missing file
  const c = await request(app).post('/api/classify');
  console.log('/api/classify without file ->', c.status === 400 ? 'expected 400' : `status ${c.status}`);

  // feedback without id
  const f = await request(app).post('/api/feedback').send({});
  console.log('/api/feedback without id ->', f.status === 400 ? 'expected 400' : `status ${f.status}`);

  console.log('Done');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
