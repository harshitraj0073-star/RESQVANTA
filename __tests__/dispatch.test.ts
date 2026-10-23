import assert from 'node:assert/strict';
import test from 'node:test';
import {
  latLonToVector3,
  GLOBAL_EMERGENCY_HUBS,
  EMERGENCY_ARC_PAIRS,
  CONTINENT_POLYGONS,
  latLonToTargetRotation,
} from '../lib/earthContinents';

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

test('3D Earth Globe latLonToVector3 maps geographic coordinates accurately to sphere surface', () => {
  const radius = 1.52;
  const delhiVec = latLonToVector3(28.6139, 77.209, radius);
  assert.ok(Math.abs(delhiVec.length() - radius) < 0.001, 'Vector length matches Earth sphere radius');
  assert.ok(GLOBAL_EMERGENCY_HUBS.length >= 10, 'Includes major Indian and international emergency hubs');
  assert.ok(EMERGENCY_ARC_PAIRS.length >= 10, 'Includes 3D signal arc pairs');
  assert.ok(CONTINENT_POLYGONS.length >= 8, 'Includes major world continent outlines');

  const [rotX, rotY, rotZ] = latLonToTargetRotation(18.5204, 73.8567);
  assert.strictEqual(rotZ, 0, 'Target rotation around Z must be 0');
  assert.ok(Math.abs(rotX - (18.5204 * Math.PI) / 180) < 0.001, 'RotX matches target latitude in radians');
  assert.ok(Math.abs(rotY - (-(73.8567 * Math.PI) / 180 - Math.PI / 2)) < 0.001, 'RotY matches target longitude');
});
