// This ensures the code only runs on the client
'use client';

let audioContext: AudioContext | null = null;
let isAudioContextInitialized = false;

function initializeAudioContext() {
  if (typeof window !== 'undefined' && !isAudioContextInitialized) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      isAudioContextInitialized = true;
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.", e);
      isAudioContextInitialized = false;
    }
  }
}


export function playClickSound() {
  // Initialize on the first user interaction
  if (!isAudioContextInitialized) {
    initializeAudioContext();
  }
  
  if (!audioContext || audioContext.state === 'suspended') {
    audioContext?.resume();
  }

  if (!audioContext) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime); // High pitch for a 'click'
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Start with some volume
    
    // Ramp down frequency and gain quickly to create a click effect
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    console.error("Could not play sound", e);
  }
}
