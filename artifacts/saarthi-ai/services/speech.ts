import { useEffect, useRef } from "react";
import type { ExpoSpeechRecognitionNativeEventMap } from "expo-speech-recognition";

type SpeechModule = typeof import("expo-speech-recognition");

// expo-speech-recognition is a native module. It is not bundled in Expo Go,
// where importing it throws, so load it lazily and degrade gracefully.
let speech: SpeechModule | null = null;
try {
  speech = require("expo-speech-recognition") as SpeechModule;
} catch {
  console.warn(
    "Speech recognition is unavailable in this build (for example Expo Go).",
  );
}

export const SpeechRecognition = speech?.ExpoSpeechRecognitionModule ?? null;

export function useSpeechEvent<K extends keyof ExpoSpeechRecognitionNativeEventMap>(
  event: K,
  listener: (payload: ExpoSpeechRecognitionNativeEventMap[K]) => void,
) {
  const listenerRef = useRef(listener);
  useEffect(() => {
    listenerRef.current = listener;
  });

  useEffect(() => {
    if (!SpeechRecognition) return;
    const handler = (payload: ExpoSpeechRecognitionNativeEventMap[K]) =>
      listenerRef.current(payload);
    const subscription = SpeechRecognition.addListener(
      event,
      handler as Parameters<typeof SpeechRecognition.addListener<K>>[1],
    );
    return () => subscription.remove();
  }, [event]);
}
