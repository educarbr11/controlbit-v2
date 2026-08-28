import { useCallback, useState } from 'react';

export type OrientationMode = 'portrait' | 'landscape';

/**
 * Versão web: mesma interface do hook nativo, mas sem travar a orientação
 * física do dispositivo (não existe "orientação de monitor" a travar) —
 * é puramente um estado de layout alternado pelo botão de "girar".
 */
export function useScreenOrientation(initial: OrientationMode = 'portrait') {
    const [orientation, setOrientation] = useState<OrientationMode>(initial);

    const set = useCallback(async (o: OrientationMode) => {
        setOrientation(o);
    }, []);

    const toggle = useCallback(async () => {
        setOrientation(prev => (prev === 'portrait' ? 'landscape' : 'portrait'));
    }, []);

    return { orientation, toggle, set, isLandscape: orientation === 'landscape' };
}
