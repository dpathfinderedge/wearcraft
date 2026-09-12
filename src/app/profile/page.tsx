'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store';
import { useToast } from '@/components/ui';
import { profileSchema, ProfileInput, addressSchema, AddressInput } from '@/lib/validations';
import { Address } from '@/types/user';
import { MapPin, User, Settings, Plus, Edit, Trash2 } from 'lucide-react';

const tabOptions = [
  { id: 'profile', label: 'Profile' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'settings', label: 'Account Settings' },
] as const;

type TabId = (typeof tabOptions)[number]['id'];

const blankAddress: AddressInput = {
  firstName: '',
  lastName: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Nigeria',
  phone: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, addresses, isAuthenticated, hasCheckedAuth, isLoading, updateProfile, addAddress, updateAddress, removeAddress, setDefaultAddress, loadAddresses } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  const addressForm = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: blankAddress,
  });

  useEffect(() => {
    if (hasCheckedAuth && !isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [hasCheckedAuth, isAuthenticated, isLoading, router]);

  // On first render, if authenticated but addresses are empty, fetch them from API
  useEffect(() => {
    if (isAuthenticated && addresses.length === 0) {
      // loadAddresses updates the store
      loadAddresses().catch(() => {
        // swallow error here; store will set error state
      });
    }
  }, [isAuthenticated, addresses.length, loadAddresses]);

  // When the user navigates to the Addresses tab, refresh addresses to ensure up-to-date data
  useEffect(() => {
    if (activeTab === 'addresses' && isAuthenticated) {
      loadAddresses().catch(() => {});
    }
  }, [activeTab, isAuthenticated, loadAddresses]);

  useEffect(() => {
    if (!user) return;

    const [firstName, ...rest] = user.name.split(' ');
    const lastName = rest.join(' ') || firstName;

    profileForm.reset({
      firstName,
      lastName,
      phone: user?.phone || '',
    });
  }, [user, profileForm]);

  useEffect(() => {
    if (editingAddress) {
      addressForm.reset({
        firstName: editingAddress.firstName,
        lastName: editingAddress.lastName,
        street: editingAddress.street,
        city: editingAddress.city,
        state: editingAddress.state,
        postalCode: editingAddress.postalCode,
        country: editingAddress.country,
        phone: editingAddress.phone,
        isDefault: editingAddress.isDefault ?? false,
      });
    } else {
      addressForm.reset({
        ...blankAddress,
        isDefault: false,
      });
    }
  }, [editingAddress, addressForm]);

  const profileName = useMemo(() => user?.name || '', [user]);

  const onSubmitProfile = async (data: ProfileInput) => {
    const result = await updateProfile(data);
    if (result.success) {
      showToast('Profile updated successfully', 'success');
    } else {
      showToast(result.error || 'Unable to update profile', 'error');
    }
  };

  const onSubmitAddress = async (data: AddressInput) => {
    setSavingAddress(true);

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      street: data.street,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      phone: data.phone,
      isDefault: data.isDefault ?? false,
    };

    let result;
    if (editingAddress) {
      result = await updateAddress(editingAddress.id, payload);
    } else {
      result = await addAddress(payload);
    }

    setSavingAddress(false);

    if (result.success) {
      setEditingAddress(null);
      addressForm.reset({
        ...blankAddress,
        isDefault: false,
      });
      showToast(editingAddress ? 'Address updated' : 'Address added', 'success');
    } else {
      showToast(result.error || 'Unable to save address', 'error');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const result = await removeAddress(addressId);
    if (result.success) {
      showToast('Address removed', 'success');
    } else {
      showToast(result.error || 'Unable to remove address', 'error');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    const result = await setDefaultAddress(addressId);
    if (result.success) {
      showToast('Default address updated', 'success');
    } else {
      showToast(result.error || 'Unable to update default address', 'error');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-2xl">
                  {profileName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Welcome back</p>
                  <h1 className="text-2xl font-semibold text-gray-900">{profileName}</h1>
                  <p className="text-sm text-gray-600">Manage your profile and shipping addresses.</p>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="space-y-2">
                {tabOptions.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left rounded-sm px-4 py-3 transition ${
                      activeTab === tab.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-8">
            {activeTab === 'profile' && (
              <div className="rounded-sm border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User size={20} />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Profile information</h2>
                    <p className="text-sm text-gray-600">Update your name and contact details.</p>
                  </div>
                </div>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First name"
                      {...profileForm.register('firstName')}
                      error={profileForm.formState.errors.firstName?.message}
                      required
                    />
                    <Input
                      label="Last name"
                      {...profileForm.register('lastName')}
                      error={profileForm.formState.errors.lastName?.message}
                      required
                    />
                  </div>
                  <Input
                    label="Email address"
                    value={user.email}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  <Input
                    label="Phone number"
                    {...profileForm.register('phone')}
                    error={profileForm.formState.errors.phone?.message}
                    placeholder="Optional"
                  />
                  <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
                    Save profile
                  </Button>
                </form>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="rounded-sm border border-gray-200 bg-white p-6">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <MapPin size={20} />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Shipping addresses</h2>
                        <p className="text-sm text-gray-600">Store your delivery addresses for faster checkout.</p>
                      </div>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setEditingAddress(null)}>
                      <Plus size={16} className="mr-2" /> Add address
                    </Button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="rounded-sm border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">
                      No saved addresses yet. Add one to make checkout faster.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="rounded-sm border border-gray-200 p-4 bg-gray-50">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                              <p className="font-medium text-gray-900">
                                {address.firstName} {address.lastName}
                                {address.isDefault && <span className="ml-2 text-xs uppercase tracking-wide text-green-700">Default</span>}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.street}, {address.city}, {address.state} {address.postalCode}, {address.country}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">{address.phone}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {!address.isDefault && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetDefault(address.id)}
                                >
                                  Set default
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setEditingAddress(address)}
                              >
                                <Edit size={14} className="mr-2" /> Edit
                              </Button>
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                <Trash2 size={14} className="mr-2" /> Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-sm border border-gray-200 bg-white p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Plus size={20} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{editingAddress ? 'Edit address' : 'Add new address'}</h3>
                      <p className="text-sm text-gray-600">Save a shipping address and optionally make it the default.</p>
                    </div>
                  </div>
                  <form onSubmit={addressForm.handleSubmit(onSubmitAddress)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First name"
                        {...addressForm.register('firstName')}
                        error={addressForm.formState.errors.firstName?.message}
                        required
                      />
                      <Input
                        label="Last name"
                        {...addressForm.register('lastName')}
                        error={addressForm.formState.errors.lastName?.message}
                        required
                      />
                    </div>
                    <Input
                      label="Street address"
                      {...addressForm.register('street')}
                      error={addressForm.formState.errors.street?.message}
                      required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="City"
                        {...addressForm.register('city')}
                        error={addressForm.formState.errors.city?.message}
                        required
                      />
                      <Input
                        label="State / Province"
                        {...addressForm.register('state')}
                        error={addressForm.formState.errors.state?.message}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Postal code"
                        {...addressForm.register('postalCode')}
                        error={addressForm.formState.errors.postalCode?.message}
                        required
                      />
                      <Input
                        label="Country"
                        {...addressForm.register('country')}
                        error={addressForm.formState.errors.country?.message}
                        required
                      />
                    </div>
                    <Input
                      label="Phone number"
                      {...addressForm.register('phone')}
                      error={addressForm.formState.errors.phone?.message}
                      required
                    />
                    <div className="flex items-center gap-3">
                      <input
                        id="defaultAddress"
                        type="checkbox"
                        {...addressForm.register('isDefault')}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <label htmlFor="defaultAddress" className="text-sm text-gray-700">
                        Set as default address
                      </label>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={savingAddress || isLoading}>
                        {editingAddress ? 'Update address' : 'Save address'}
                      </Button>
                      {editingAddress && (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="flex-1"
                          onClick={() => setEditingAddress(null)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="rounded-sm border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Settings size={20} />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Account settings</h2>
                    <p className="text-sm text-gray-600">Your account details and preferences.</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Registered email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                  <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Member since</p>
                    <p className="font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Account actions</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <Link href="/orders" className="inline-flex items-center justify-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 hover:bg-gray-50">
                        View orders
                      </Link>
                      <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => router.push('/auth/login')}>
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
