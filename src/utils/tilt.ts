import type { TiltDirection } from '../components/MicrobitTiltVisual';

// Direção do tilt com histerese: precisa passar de ENTER_THRESHOLD para "entrar"
// numa direção e voltar abaixo de EXIT_THRESHOLD para "sair" (evita oscilação na borda).
const TILT_ENTER_THRESHOLD = 0.35;
const TILT_EXIT_THRESHOLD = 0.2;

export function getTiltDirection(
  x: number,
  y: number,
  isLandscape: boolean,
  current: TiltDirection,
  invertVertical: boolean,
  invertHorizontal: boolean,
): TiltDirection {
  // Em portrait, inclinar o topo do celular para frente/trás move no eixo Y;
  // inclinar para os lados move no eixo X. Em landscape a tela girou 90°, então
  // os eixos físicos do acelerômetro trocam de papel.
  let forwardAxis = isLandscape ? x : y;
  let sideAxis = isLandscape ? -y : -x;
  // Correção manual — em alguns aparelhos/orientações o mapeamento acima sai
  // invertido (ex: paisagem-direita vs paisagem-esquerda); os widgets de
  // inversão na tela cheia dão ao usuário como corrigir sem depender de nós
  // acertarmos o lado físico certo pra cada device.
  if (invertVertical) forwardAxis = -forwardAxis;
  if (invertHorizontal) sideAxis = -sideAxis;

  const threshold = (dir: TiltDirection) =>
    dir === current ? TILT_EXIT_THRESHOLD : TILT_ENTER_THRESHOLD;

  if (forwardAxis <= -threshold('up')) return 'up';
  if (forwardAxis >= threshold('down')) return 'down';
  if (sideAxis <= -threshold('left')) return 'left';
  if (sideAxis >= threshold('right')) return 'right';
  return null;
}
