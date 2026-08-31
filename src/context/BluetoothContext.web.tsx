/// <reference types="web-bluetooth" />
import React, {
  createContext, useContext, useState, useCallback, useRef, useMemo, ReactNode,
} from "react";
import { BluetoothStatus, ScannedDevice } from "../types/control.types";

// ─── BLE UUIDs (mesmos do provider nativo) ────────────────────────────────────
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_UUID      = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const HM10_SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
const HM10_CHAR_UUID    = "0000ffe1-0000-1000-8000-00805f9b34fb";

type UnsupportedReason =
  | "no-web-bluetooth"
  | "ios-no-web-bluetooth"
  | "insecure-context"
  | null;

interface WebDevice {
  id: string;
  name?: string;
}

interface BluetoothContextData {
  status: BluetoothStatus;
  device: WebDevice | null;
  isConnected: boolean;
  isScanning: boolean;
  bluetoothEnabled: boolean;
  scannedDevices: ScannedDevice[];
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: ScannedDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
  unsupportedReason: UnsupportedReason;
  lastError: string | null;
}

export const BluetoothContext = createContext<BluetoothContextData>(
  {} as BluetoothContextData,
);

// iOS/iPadOS: todo navegador na App Store (Safari, Chrome, Edge...) é obrigado a
// usar o motor WebKit, que nunca implementou Web Bluetooth — não é algo que dá
// pra contornar por configuração, só usando um app com pilha própria (Bluefy/WebBLE).
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isAppleMobileUA = /iPad|iPhone|iPod/.test(ua);
  // iPadOS "desktop" reporta UA de Mac, mas tem touch — diferencia de um Mac de verdade.
  const isIPadDesktopMode =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isAppleMobileUA || isIPadDesktopMode;
}

function detectUnsupportedReason(): UnsupportedReason {
  if (typeof navigator === "undefined" || !("bluetooth" in navigator)) {
    return isIOS() ? "ios-no-web-bluetooth" : "no-web-bluetooth";
  }
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return "insecure-context";
  }
  return null;
}

// ─── Provider (Web Bluetooth API) ─────────────────────────────────────────────
export const BluetoothProvider = ({ children }: { children: ReactNode }) => {
  const [device, setDevice] = useState<WebDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const unsupportedReason = useMemo(detectUnsupportedReason, []);

  const nativeDeviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

  const status: BluetoothStatus = isConnected
    ? "connected"
    : isConnecting
    ? "connecting"
    : "disconnected";

  // ── Desconexão (voluntária ou inesperada) ───────────────────────────────────
  const handleDisconnected = useCallback(() => {
    nativeDeviceRef.current?.removeEventListener(
      "gattserverdisconnected",
      handleDisconnected,
    );
    nativeDeviceRef.current = null;
    characteristicRef.current = null;
    setDevice(null);
    setIsConnected(false);
  }, []);

  const disconnect = useCallback(async () => {
    try {
      nativeDeviceRef.current?.gatt?.disconnect();
    } catch (_) {
      // já desconectado
    }
    handleDisconnected();
  }, [handleDisconnected]);

  // Web Bluetooth não tem scan contínuo cancelável — no-op.
  const stopScan = useCallback(() => {}, []);

  // ── "Escanear" na web = abrir o picker nativo do navegador + conectar ───────
  const startScan = useCallback(async () => {
    setLastError(null);
    if (unsupportedReason) return;

    setIsConnecting(true);
    try {
      // O micro:bit normalmente NÃO anuncia o UUID do serviço UART no pacote de
      // advertising (o payload de 31 bytes do BLE legado mal cabe o nome +
      // flags junto de um UUID de 128 bits) — só expõe o serviço após conectar.
      // Por isso filtramos o micro:bit pelo prefixo do nome ("BBC micro:bit ..."),
      // e módulos HM-10/HC-08 (que costumam anunciar o serviço 0xFFE0) por serviço.
      const picked = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: "BBC micro:bit" },
          { namePrefix: "micro:bit" },
          { services: [HM10_SERVICE_UUID] },
        ],
        optionalServices: [
          UART_SERVICE_UUID, UART_RX_UUID, HM10_SERVICE_UUID, HM10_CHAR_UUID,
        ],
      });

      if (!picked.gatt) throw new Error("Dispositivo sem suporte a GATT");

      const server = await picked.gatt.connect();

      let characteristic: BluetoothRemoteGATTCharacteristic;
      try {
        const service = await server.getPrimaryService(UART_SERVICE_UUID);
        characteristic = await service.getCharacteristic(UART_RX_UUID);
      } catch (_) {
        const service = await server.getPrimaryService(HM10_SERVICE_UUID);
        characteristic = await service.getCharacteristic(HM10_CHAR_UUID);
      }

      picked.addEventListener("gattserverdisconnected", handleDisconnected);

      nativeDeviceRef.current = picked;
      characteristicRef.current = characteristic;
      setDevice({ id: picked.id, name: picked.name });
      setIsConnected(true);
    } catch (e: any) {
      // Usuário cancelou o picker — não é um erro a reportar.
      if (e?.name !== "NotFoundError") {
        console.error("[BT-Web] Erro na conexão:", e);
        setLastError("connect-error");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [unsupportedReason, handleDisconnected]);

  // Mantido pela mesma assinatura da versão nativa; na web a escolha do
  // dispositivo já acontece dentro do picker disparado por startScan().
  const connectToDevice = useCallback(async (_deviceInfo: ScannedDevice) => {
    await startScan();
  }, [startScan]);

  // ── Envio de comando ─────────────────────────────────────────────────────────
  const sendCommand = useCallback(async (command: string) => {
    const characteristic = characteristicRef.current;
    if (!characteristic) return;
    try {
      const payload = new TextEncoder().encode(command + "\n");
      await characteristic.writeValueWithoutResponse(payload);
    } catch (e) {
      console.error(`[BT-Web] Erro ao enviar "${command}":`, e);
    }
  }, []);

  const contextValue = useMemo(() => ({
    status,
    device,
    isConnected,
    isScanning: false,
    bluetoothEnabled: !unsupportedReason,
    scannedDevices: [] as ScannedDevice[],
    startScan,
    stopScan,
    connectToDevice,
    disconnect,
    sendCommand,
    unsupportedReason,
    lastError,
  }), [
    status, device, isConnected, unsupportedReason,
    startScan, stopScan, connectToDevice, disconnect, sendCommand, lastError,
  ]);

  return (
    <BluetoothContext.Provider value={contextValue}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);
