import { useEffect, useState } from 'react';

type LandingEnhancement = 'pending' | 'ready' | 'unavailable';

export function useLandingEnhancement(
  load?: () => Promise<unknown>,
): LandingEnhancement {
  const [enhancement, setEnhancement] = useState<LandingEnhancement>('pending');

  useEffect(() => {
    if (!load) {
      return;
    }

    let isActive = true;

    const enhance = async (): Promise<void> => {
      try {
        await load();
      }
      catch (error) {
        console.error('Could not load the interactive landing content.', error);

        if (isActive) {
          setEnhancement('unavailable');
        }

        return;
      }

      if (isActive) {
        setEnhancement('ready');
      }
    };

    void enhance();

    return () => {
      isActive = false;
    };
  }, [load]);

  return enhancement;
}
