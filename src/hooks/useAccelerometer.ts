import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

const UPDATE_INTERVAL_MS = 100;

export function useAccelerometer(enabled: boolean) {
  const [data, setData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!enabled) {
      setData({ x: 0, y: 0, z: 0 });
      return;
    }

    Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
    const subscription = Accelerometer.addListener(setData);

    return () => {
      subscription.remove();
    };
  }, [enabled]);

  return data;
}
