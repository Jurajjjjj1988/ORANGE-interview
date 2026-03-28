const https = require('https');
const http = require('http');

console.log('\n🔍 PRIAME TESTOVANIE BUG-004\n');
console.log('URL: https://www.orange.sk/moj-orange/');
console.log('Očakávaný výsledok: 301 → http:// (HTTPS → HTTP downgrade)\n');
console.log('=' .repeat(60));

// HTTPS request BEZ nasledovania redirectov
const options = {
  hostname: 'www.orange.sk',
  path: '/moj-orange/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  },
  maxRedirects: 0 // KRITICKÉ: nesleduj redirecty!
};

const req = https.request(options, (res) => {
  console.log(`\n✅ RESPONSE:`);
  console.log(`   HTTP Status: ${res.statusCode}`);
  console.log(`   HTTP Version: ${res.httpVersion}`);
  console.log(`\n📋 HEADERS:`);

  // Vypíš všetky headery
  Object.entries(res.headers).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  console.log(`\n🔍 ANALÝZA:`);

  if (res.statusCode === 301) {
    console.log(`   ✅ Status je 301 (Moved Permanently) - OK`);
  } else {
    console.log(`   ❌ Status je ${res.statusCode}, expected 301`);
  }

  const location = res.headers['location'];
  if (location) {
    console.log(`   ✅ Location header existuje: "${location}"`);

    if (location.startsWith('http://')) {
      console.log(`\n   🔴 KRITICKÉ: Location je HTTP (bez HTTPS!)`);
      console.log(`   🔴 BUG POTVRDENÝ: HTTPS → HTTP DOWNGRADE`);
      console.log(`\n   Riziko: Session cookies a credentials sú na nešifrovanej ceste!`);
    } else if (location.startsWith('https://')) {
      console.log(`   ✅ Location je HTTPS - OK, bez downgrade`);
    }
  } else {
    console.log(`   ❌ Location header CHÝBA`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 ZÁVER:');

  if (res.statusCode === 301 && location && location.startsWith('http://')) {
    console.log('   🔴 BUG POTVRDENÝ: HTTP DOWNGRADE EXISTUJE!\n');
    process.exit(0);
  } else {
    console.log('   ✅ Žiadny HTTP downgrade nenájdený\n');
    process.exit(1);
  }
});

req.on('error', (error) => {
  console.error(`\n❌ Chyba pri requeste:`, error.message);
  process.exit(1);
});

req.end();
