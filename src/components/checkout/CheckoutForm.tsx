'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, AddressInput } from '@/lib/validations';
import { Input, Button } from '@/components/ui';

interface CheckoutFormProps {
  onSubmit: (data: AddressInput) => void;
  defaultValues?: Partial<AddressInput>;
  isLoading?: boolean;
  loadPaystackScript?: boolean;
  onPaystackLoad?: () => void;
  onPaystackError?: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSubmit,
  defaultValues,
  isLoading,
  loadPaystackScript = false,
  onPaystackLoad,
  onPaystackError,
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!loadPaystackScript || !formRef.current) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => onPaystackLoad?.();
    script.onerror = () => onPaystackError?.();
    formRef.current.appendChild(script);

    return () => {
      script.remove();
    };
  }, [loadPaystackScript, onPaystackError, onPaystackLoad]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            {...register('firstName')}
            error={errors.firstName?.message}
            required
          />
          <Input
            label="Last Name"
            {...register('lastName')}
            error={errors.lastName?.message}
            required
          />
        </div>
      </div>


      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Shipping Address
        </h3>
        <div className="space-y-4">
          <Input
            label="Street Address"
            {...register('street')}
            error={errors.street?.message}
            placeholder="123 Main Street"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="City"
              {...register('city')}
              error={errors.city?.message}
              required
            />
            <Input
              label="State/Province"
              {...register('state')}
              error={errors.state?.message}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Postal Code"
              {...register('postalCode')}
              error={errors.postalCode?.message}
              required
            />
            <Input
              label="Country"
              {...register('country')}
              error={errors.country?.message}
              placeholder="Nigeria"
              required
            />
          </div>
          <Input
            label="Phone Number"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="+234 xxx xxx xxxx"
            required
          />
        </div>
      </div>


      <Button
        type="submit"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        Save Address & Continue
      </Button>
    </form>
  );
};