import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addressCreateSchema,
  addressUpdateSchema,
  profileUpdateSchema,
} from './account-validation';

const validAddress = {
  firstName: 'Rae',
  lastName: 'Smith',
  address: '12 Market Street',
  city: 'Lagos',
  state: 'Lagos',
  zipCode: '100001',
  country: 'Nigeria',
  phone: '+234 800 000 0000',
};

test('trims profile fields and rejects role or email changes', () => {
  assert.deepEqual(
    profileUpdateSchema.parse({
      firstName: ' Rae ',
      lastName: ' Smith ',
      phone: ' +2348000000000 ',
    }),
    {
      firstName: 'Rae',
      lastName: 'Smith',
      phone: '+2348000000000',
    }
  );

  assert.equal(
    profileUpdateSchema.safeParse({
      firstName: 'Rae',
      lastName: 'Smith',
      role: 'ADMIN',
    }).success,
    false
  );
});

test('rejects blank and oversized profile fields', () => {
  for (const input of [
    { firstName: '  ', lastName: 'Smith' },
    { firstName: 'Rae', lastName: '  ' },
    { firstName: 'R'.repeat(101), lastName: 'Smith' },
    { firstName: 'Rae', lastName: 'S'.repeat(101) },
    { firstName: 'Rae', lastName: 'Smith', phone: '123456' },
    { firstName: 'Rae', lastName: 'Smith', phone: 'p'.repeat(41) },
  ]) {
    assert.equal(profileUpdateSchema.safeParse(input).success, false);
  }
});

test('trims and validates address fields with explicit maximum lengths', () => {
  assert.deepEqual(
    addressCreateSchema.parse({
      ...validAddress,
      firstName: ' Rae ',
      address: ' 12 Market Street ',
      country: ' Nigeria ',
    }),
    {
      ...validAddress,
      firstName: 'Rae',
      address: '12 Market Street',
      country: 'Nigeria',
    }
  );

  for (const input of [
    { ...validAddress, address: 'A'.repeat(301) },
    { ...validAddress, city: 'C'.repeat(101) },
    { ...validAddress, zipCode: 'Z'.repeat(31) },
    { ...validAddress, phone: 'P'.repeat(41) },
    { ...validAddress, isDefault: 'true' },
    { ...validAddress, userId: 'another-user' },
  ]) {
    assert.equal(addressCreateSchema.safeParse(input).success, false);
  }
});

test('allows partial address edits but rejects empty and unknown-field updates', () => {
  assert.deepEqual(addressUpdateSchema.parse({ city: ' Lagos ' }), { city: 'Lagos' });
  assert.deepEqual(addressUpdateSchema.parse({ isDefault: true }), { isDefault: true });
  assert.equal(addressUpdateSchema.safeParse({}).success, false);
  assert.equal(addressUpdateSchema.safeParse({ userId: 'another-user' }).success, false);
});
