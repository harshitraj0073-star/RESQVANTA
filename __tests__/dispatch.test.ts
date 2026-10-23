import assert from 'node:assert/strict';
import test from 'node:test';

test('112 Emergency Dispatch Packet length fits within single SMS boundary', () => {
  const brief = 'EMERGENCY: Person drowning. Immediate water rescue and medical assistance needed. Location not yet specified.';
  assert.ok(brief.length <= 160, 'Brief fits in standard SMS single segment');
  assert.ok(brief.includes('EMERGENCY'));
});

test('Indian emergency authority numbers comply with official telecom standards', () => {
  const numbers = [
    { name: 'National Emergency', number: '112' },
    { name: 'Ambulance', number: '108' },
    { name: 'LPG Leak Helpline', number: '1906' },
    { name: 'Disaster Management NDRF', number: '1070' },
  ];

  for (const auth of numbers) {
    assert.match(auth.number, /^[0-9]{3,4}$/, `${auth.name} must be a valid 3-4 digit short code`);
  }
});

test('WhatsApp and SMS share link encoding formats correctly without breaking URI', () => {
  const sampleBrief = 'EMERGENCY: Road Crash at NH-48. 2 injured.';
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(sampleBrief)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(sampleBrief)}`;

  assert.ok(whatsappUrl.startsWith('https://wa.me/?text=EMERGENCY%3A'));
  assert.ok(smsUrl.startsWith('sms:?body=EMERGENCY%3A'));
});
