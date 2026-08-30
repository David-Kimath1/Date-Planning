// Sound utility using Web Audio API
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.2) {
  frequencies.forEach((freq, index) => {
    setTimeout(() => playTone(freq, duration, type, volume), index * 100);
  });
}

// Sound for creating a plan (pleasant ascending tones)
export function playCreateSound() {
  playChord([523.25, 659.25, 783.99], 0.3, 'sine', 0.3); // C5, E5, G5
}

// Sound for confirming a plan (triumphant chord)
export function playConfirmSound() {
  playChord([523.25, 659.25, 783.99, 1046.50], 0.5, 'sine', 0.3); // C major arpeggio
}

// Sound for deleting (soft descending tones)
export function playDeleteSound() {
  playChord([659.25, 523.25, 392.00], 0.3, 'sine', 0.25); // E5, C5, G4
}

// Sound for notification (gentle chime)
export function playNotificationSound() {
  playTone(880, 0.3, 'sine', 0.3); // A5
  setTimeout(() => playTone(1108.73, 0.4, 'sine', 0.25), 150); // C#6
}

// Sound for agreement (harmonious chord)
export function playAgreementSound() {
  playChord([523.25, 783.99], 0.4, 'sine', 0.25); // C5, G5
}

// Toggle sound settings
let soundEnabled = true;

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function playSound(type: 'create' | 'confirm' | 'delete' | 'notification' | 'agreement') {
  if (!soundEnabled) return;
  
  try {
    switch (type) {
      case 'create':
        playCreateSound();
        break;
      case 'confirm':
        playConfirmSound();
        break;
      case 'delete':
        playDeleteSound();
        break;
      case 'notification':
        playNotificationSound();
        break;
      case 'agreement':
        playAgreementSound();
        break;
    }
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}
