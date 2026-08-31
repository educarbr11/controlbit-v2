import React from 'react';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Svg, { Rect, Circle } from 'react-native-svg';
import { Colors } from '../constants/theme';

export type TiltDirection = 'up' | 'down' | 'left' | 'right' | null;

// Padrões da matriz de LED 5x5, ao estilo das setas do micro:bit.
const LED_PATTERNS: Record<'up' | 'down' | 'left' | 'right' | 'neutral', number[][]> = {
  up: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  down: [
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  left: [
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  right: [
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  neutral: [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
  ],
};

interface Props {
  x: number;
  y: number;
  direction: TiltDirection;
  isLandscape: boolean;
  /** Inverte a inclinação visual esquerda/direita — mesma flag usada em getTiltDirection. */
  invertHorizontal?: boolean;
  /** Inverte a inclinação visual cima/baixo — mesma flag usada em getTiltDirection. */
  invertVertical?: boolean;
  size?: number;
}

const MAX_TILT_DEG = 28;

export default function MicrobitTiltVisual({
  x, y, direction, isLandscape, invertHorizontal, invertVertical, size = 200,
}: Props) {
  // Mesma troca de eixos usada na leitura de direção: em landscape a tela girou 90°.
  let rollX = isLandscape ? y : x;
  let rollY = isLandscape ? x : y;
  if (invertHorizontal) rollX = -rollX;
  if (invertVertical) rollY = -rollY;

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const rotateXDeg = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, rollY * -40));
    const rotateYDeg = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, rollX * -40));
    return {
      transform: [
        { perspective: 600 },
        { rotateX: withTiming(`${rotateXDeg}deg`, { duration: 120 }) },
        { rotateY: withTiming(`${rotateYDeg}deg`, { duration: 120 }) },
      ],
    };
  });

  const pattern = LED_PATTERNS[direction ?? 'neutral'];
  const boardW = size;
  const boardH = size * 1.15;
  const gridSize = size * 0.62;
  const cell = gridSize / 5;
  const gridX = (boardW - gridSize) / 2;
  const gridY = boardH * 0.16;

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={boardW} height={boardH} viewBox={`0 0 ${boardW} ${boardH}`}>
        {/* Placa */}
        <Rect x={0} y={0} width={boardW} height={boardH} rx={16} fill={Colors.dark} />

        {/* Matriz de LEDs 5x5 */}
        {pattern.map((row, r) =>
          row.map((lit, c) => (
            <Circle
              key={`${r}-${c}`}
              cx={gridX + c * cell + cell / 2}
              cy={gridY + r * cell + cell / 2}
              r={cell * 0.28}
              fill={lit ? '#FF3B30' : '#3A3A3A'}
            />
          )),
        )}

        {/* Botões A/B */}
        <Circle cx={boardW * 0.12} cy={boardH * 0.55} r={boardW * 0.055} fill="#2A2A2A" stroke="#555" strokeWidth={2} />
        <Circle cx={boardW * 0.88} cy={boardH * 0.55} r={boardW * 0.055} fill="#2A2A2A" stroke="#555" strokeWidth={2} />

        {/* Conector de borda (pinos dourados) */}
        <Rect x={boardW * 0.08} y={boardH * 0.88} width={boardW * 0.84} height={boardH * 0.08} fill="#D4AF37" rx={4} />
      </Svg>
    </Animated.View>
  );
}
