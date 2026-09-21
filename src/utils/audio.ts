/**
 * Audio synthesis engine for Orbi AI.
 * Uses Web Audio API and Web Speech API without external binary dependencies.
 */

let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Gentle pleasant bell chime for alarms and notifications
export function playChime(type: 'alarm' | 'notification' | 'success' | 'chime' = 'notification') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    if (type === 'alarm') {
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3); // A5
      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.4); // D6
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } else if (type === 'success') {
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);
    } else {
      // Notification
      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);
    }
  } catch (e) {
    console.warn('Audio playback not permitted or unavailable:', e);
  }
}

// Background sound generator for Focus Mode (Pink noise + binaural drone)
let focusOscNode: OscillatorNode | null = null;
let focusGainNode: GainNode | null = null;

export function startFocusSound() {
  try {
    const ctx = getAudioContext();
    if (focusOscNode) return; // already playing

    focusOscNode = ctx.createOscillator();
    focusGainNode = ctx.createGain();

    focusOscNode.type = 'sine';
    focusOscNode.frequency.setValueAtTime(136.1, ctx.currentTime); // 136.1Hz calming Om frequency

    // Soft gentle volume
    focusGainNode.gain.setValueAtTime(0.01, ctx.currentTime);
    focusGainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);

    focusOscNode.connect(focusGainNode);
    focusGainNode.connect(ctx.destination);
    focusOscNode.start();
  } catch (e) {
    console.warn('Could not start focus audio:', e);
  }
}

export function stopFocusSound() {
  try {
    if (focusOscNode && focusGainNode && audioCtx) {
      focusGainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        focusOscNode?.stop();
        focusOscNode?.disconnect();
        focusOscNode = null;
        focusGainNode = null;
      }, 600);
    }
  } catch (e) {
    focusOscNode = null;
    focusGainNode = null;
  }
}

// Speech synthesis for Orbi voice answers
export function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick pt-BR voice if present
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang.includes('pt') || v.lang.includes('BR'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis failed:', e);
    onEnd?.();
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
