import { test } from "node:test";
import assert from "node:assert";
import * as THREE from "three";
import {
  GROUNDED_CITIES,
  latLonToSphereVector3,
  latLonToCameraEuler,
  getSurfaceOrientation,
  haversineDistanceKm,
  resolveTargetCity,
} from "../lib/geospatial";

test("WGS84 Sphere Vector mapping preserves sphere radius R", () => {
  const radius = 1.52;
  for (const city of GROUNDED_CITIES) {
    const vec = latLonToSphereVector3(city.lat, city.lon, radius);
    const length = vec.length();
    assert(
      Math.abs(length - radius) < 1e-6,
      `Radius mismatch for ${city.name}: got ${length}, expected ${radius}`
    );
  }
});

test("Camera rotation Euler angles brings target city directly to facing +Z (0, 0, R)", () => {
  const radius = 1.52;
  for (const city of GROUNDED_CITIES) {
    const localVec = latLonToSphereVector3(city.lat, city.lon, radius);
    const rot = latLonToCameraEuler(city.lat, city.lon);
    const euler = new THREE.Euler(rot[0], rot[1], rot[2], "XYZ");

    const rotatedVec = localVec.clone().applyEuler(euler);

    // After rotation, rotatedVec should be approximately (0, 0, radius)
    assert(
      Math.abs(rotatedVec.x) < 1e-4,
      `Expected X near 0 for ${city.name}, got ${rotatedVec.x}`
    );
    assert(
      Math.abs(rotatedVec.y) < 1e-4,
      `Expected Y near 0 for ${city.name}, got ${rotatedVec.y}`
    );
    assert(
      Math.abs(rotatedVec.z - radius) < 1e-4,
      `Expected Z near ${radius} for ${city.name}, got ${rotatedVec.z}`
    );
  }
});

test("Relative city geography matches real India geography", () => {
  const pune = GROUNDED_CITIES.find((c) => c.id === "pune")!;
  const mumbai = GROUNDED_CITIES.find((c) => c.id === "mumbai")!;
  const delhi = GROUNDED_CITIES.find((c) => c.id === "delhi")!;
  const blr = GROUNDED_CITIES.find((c) => c.id === "bengaluru")!;
  const kolkata = GROUNDED_CITIES.find((c) => c.id === "kolkata")!;

  // Mumbai is West of Pune
  assert(mumbai.lon < pune.lon, "Mumbai should be west of Pune");

  // Delhi is North of Pune
  assert(delhi.lat > pune.lat, "Delhi should be north of Pune");

  // Bengaluru is South of Pune
  assert(blr.lat < pune.lat, "Bengaluru should be south of Pune");

  // Kolkata is East of Delhi
  assert(kolkata.lon > delhi.lon, "Kolkata should be east of Delhi");

  // Distance checks (approximate real-world ground truth)
  const dPuneMumbai = haversineDistanceKm(pune.lat, pune.lon, mumbai.lat, mumbai.lon);
  assert(dPuneMumbai > 100 && dPuneMumbai < 160, `Pune-Mumbai distance (~120km), got ${dPuneMumbai}`);

  const dPuneDelhi = haversineDistanceKm(pune.lat, pune.lon, delhi.lat, delhi.lon);
  assert(dPuneDelhi > 1100 && dPuneDelhi < 1300, `Pune-Delhi distance (~1170km), got ${dPuneDelhi}`);
});

test("Surface normal and quaternion align surface geometry flush with sphere", () => {
  const pune = GROUNDED_CITIES[0];
  const { position, normal, quaternion } = getSurfaceOrientation(pune.lat, pune.lon, 1.52);

  // Normal length must be 1.0
  assert(Math.abs(normal.length() - 1.0) < 1e-6, "Normal must be normalized");

  // Normal must point in the exact same direction as position
  const posDir = position.clone().normalize();
  assert(normal.distanceTo(posDir) < 1e-6, "Normal must match position direction");

  // Applying quaternion to (0, 0, 1) must yield normal
  const transformedZ = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
  assert(
    transformedZ.distanceTo(normal) < 1e-6,
    "Quaternion must rotate +Z vector to surface normal"
  );
});

test("resolveTargetCity correctly resolves preset coordinates and fallback", () => {
  const puneResolved = resolveTargetCity("18.5204, 73.8567");
  assert.strictEqual(puneResolved.city.id, "pune");
  assert.strictEqual(puneResolved.isMatchedPreset, true);

  const delhiResolved = resolveTargetCity("28.6139, 77.2090");
  assert.strictEqual(delhiResolved.city.id, "delhi");
  assert.strictEqual(delhiResolved.isMatchedPreset, true);

  const nullResolved = resolveTargetCity(null);
  assert.strictEqual(nullResolved.city.id, "pune");
});
