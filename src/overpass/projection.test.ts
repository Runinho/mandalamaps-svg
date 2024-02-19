// const orgPos = {lat: 48.846385, lon:2.3363723};
// const pixel = mercator(orgPos)
// const orgPosBack = mercator_inv(pixel)
// console.log("inverse test", orgPos, pixel, orgPosBack)

import {mercator, mercator_inv} from "@/overpass/projection";
import {expect, test} from "@jest/globals";

test('check if mercator_inv(mercator(pos)) == pos Paris', () => {
  const orgPos = {lat: 48.846385, lon:2.3363723};
  const pixel = mercator(orgPos)
  const orgPosBack = mercator_inv(pixel)
  console.log("inverse test", orgPos, pixel, orgPosBack)
  expect(orgPos.lat).toBe(orgPosBack.lat);
  expect(orgPos.lon).toBeCloseTo(orgPosBack.lon);
});

test('check if mercator_inv(mercator(pos)) == pos LA', () => {
  const orgPos = {lat: 34.052235, lon:-118.243683};
  const pixel = mercator(orgPos)
  const orgPosBack = mercator_inv(pixel)
  console.log("inverse test", orgPos, pixel, orgPosBack)
  expect(orgPos.lat).toBe(orgPosBack.lat);
  expect(orgPos.lon).toBeCloseTo(orgPosBack.lon);
});

test('check if mercator_inv(mercator(pos)) == pos Rio', () => {
  const orgPos = {lat: -22.908333, lon:-43.196388};
  const pixel = mercator(orgPos)
  const orgPosBack = mercator_inv(pixel)
  console.log("inverse test", orgPos, pixel, orgPosBack)
  expect(orgPos.lat).toBe(orgPosBack.lat);
  expect(orgPos.lon).toBeCloseTo(orgPosBack.lon);
});

test('check if mercator_inv(mercator(pos)) == pos Sydney', () => {
  const orgPos = {lat: -33.865143, lon:151.209900};
  const pixel = mercator(orgPos)
  const orgPosBack = mercator_inv(pixel)
  console.log("inverse test", orgPos, pixel, orgPosBack)
  expect(orgPos.lat).toBeCloseTo(orgPosBack.lat, 0.0000001);
  expect(orgPos.lon).toBeCloseTo(orgPosBack.lon);
});