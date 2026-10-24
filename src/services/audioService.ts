import { VoiceOption } from '../types/forex';

export const ELEVENLABS_VOICES: VoiceOption[] = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Calm & Professional)', gender: 'Female', previewDescription: 'Clear institutional broadcast tone' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (Strong & Energetic)', gender: 'Female', previewDescription: 'Fast-paced market desk commentary' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Soft & Clear)', gender: 'Female', previewDescription: 'Crisp articulation for technical briefs' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Analytical)', gender: 'Male', previewDescription: 'Financial strategist cadence' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (Confident)', gender: 'Female', previewDescription: 'Senior macro analyst voice' },
  { id: 'TxGEqnscnnW249_DEi4', name: 'Josh (Deep & Authoritative)', gender: 'Male', previewDescription: 'Bloomberg anchor resonance' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Clear & Direct)', gender: 'Male', previewDescription: 'Decisive order-flow execution style' },
  { id: 'yoZ06aGfM21300435900', name: 'Sam (Dynamic Reporter)', gender: 'Male', previewDescription: 'Market flash news delivery' }
];

export type AudioEngine = 'elevenlabs' | 'webspeech' | 'none';
export type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused';

export class ForexAudioService {
  private audioEl: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeEngine: AudioEngine = 'none';

  public async playVoiceover(
    text: string,
    options: {
      apiKey?: string;
      voiceId?: string;
      speed?: number;
      onStatusChange: (status: AudioStatus, engine: AudioEngine) => void;
    }
  ) {
    this.stop();

    if (!text || !text.trim()) {
      options.onStatusChange('idle', 'none');
      return;
    }

    const { apiKey, voiceId = ELEVENLABS_VOICES[0].id, speed = 1.0, onStatusChange } = options;

    // Try ElevenLabs if API key provided
    if (apiKey && apiKey.trim().length > 10) {
      try {
        onStatusChange('loading', 'elevenlabs');
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey.trim()
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.8
            }
          })
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          this.audioEl = audio;
          this.activeEngine = 'elevenlabs';

          audio.playbackRate = speed;
          audio.onplay = () => onStatusChange('playing', 'elevenlabs');
          audio.onpause = () => {
            if (audio.currentTime < audio.duration) {
              onStatusChange('paused', 'elevenlabs');
            }
          };
          audio.onended = () => {
            onStatusChange('idle', 'none');
            URL.revokeObjectURL(url);
            this.audioEl = null;
          };
          audio.onerror = () => {
            console.warn('ElevenLabs playback error, switching to browser speech.');
            this.playWebSpeech(text, speed, onStatusChange);
          };

          await audio.play();
          return;
        } else {
          console.warn(`ElevenLabs error status ${res.status}, falling back to Web Speech`);
        }
      } catch (err) {
        console.warn('ElevenLabs API request failed:', err);
      }
    }

    // Fallback: Web Speech API
    this.playWebSpeech(text, speed, onStatusChange);
  }

  private playWebSpeech(
    text: string,
    speed: number,
    onStatusChange: (status: AudioStatus, engine: AudioEngine) => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onStatusChange('idle', 'none');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;
    this.activeEngine = 'webspeech';

    utterance.rate = Math.max(0.7, Math.min(1.5, speed));
    utterance.pitch = 1.0;

    // Pick best natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Daniel') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => onStatusChange('playing', 'webspeech');
    utterance.onpause = () => onStatusChange('paused', 'webspeech');
    utterance.onresume = () => onStatusChange('playing', 'webspeech');
    utterance.onend = () => {
      onStatusChange('idle', 'none');
      this.currentUtterance = null;
    };
    utterance.onerror = () => {
      onStatusChange('idle', 'none');
      this.currentUtterance = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause(onStatusChange: (status: AudioStatus, engine: AudioEngine) => void) {
    if (this.activeEngine === 'elevenlabs' && this.audioEl) {
      this.audioEl.pause();
      onStatusChange('paused', 'elevenlabs');
    } else if (this.activeEngine === 'webspeech' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      onStatusChange('paused', 'webspeech');
    }
  }

  public resume(onStatusChange: (status: AudioStatus, engine: AudioEngine) => void) {
    if (this.activeEngine === 'elevenlabs' && this.audioEl) {
      this.audioEl.play().catch(console.error);
      onStatusChange('playing', 'elevenlabs');
    } else if (this.activeEngine === 'webspeech' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      onStatusChange('playing', 'webspeech');
    }
  }

  public stop() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      this.audioEl = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.activeEngine = 'none';
  }
}

export const fxAudioService = new ForexAudioService();
