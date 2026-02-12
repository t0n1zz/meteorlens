import { useEffect } from 'react';
import { useAddressesStore } from '../store/addressesStore';

export function useAddresses() {
  const { hydrate, hydrated } = useAddressesStore();

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  return useAddressesStore();
}
