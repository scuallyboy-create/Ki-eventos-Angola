// Elegant harmonic audio synthesizer using Web Audio API for background celebration music
class AmbientCelebrationPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;

  // Gentle acoustic bell/piano-like chords in F major / D minor
  private chords = [
    [349.23, 440.0, 523.25, 659.25], // F major 7
    [293.66, 349.23, 440.0, 523.25], // D minor 7
    [261.63, 329.63, 392.0, 493.88], // C major 7
    [392.0, 493.88, 587.33, 698.46],  // G7 / Bm
  ];

  private currentChordIndex = 0;

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public start() {
    this.init();
    if (!this.ctx) return;
    this.isPlaying = true;
    this.currentChordIndex = 0;
    this.playNextArpeggio();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private playTone(freq: number, delaySec: number, durationSec: number = 3.0) {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime + delaySec;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Gentle sine / warm triangle blend
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle gentle attack and long delicate decay
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec);
  }

  private playNextArpeggio() {
    if (!this.isPlaying || !this.ctx) return;

    const chord = this.chords[this.currentChordIndex];
    // Gentle arpeggiated notes
    chord.forEach((freq, idx) => {
      this.playTone(freq, idx * 0.45, 3.2);
    });

    this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;

    // Loop after 2.8s
    this.timerId = window.setTimeout(() => {
      this.playNextArpeggio();
    }, 2800);
  }
}

export const celebrationAudio = new AmbientCelebrationPlayer();
