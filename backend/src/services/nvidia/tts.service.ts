import axios from 'axios';
import { config } from '../../config';

/**
 * Text-to-Speech Service
 * Uses NVIDIA FastPitch via NIM
 */
export class TTSService {
  /**
   * Convert text to speech audio buffer
   */
  static async synthesize(
    text: string,
    voiceParams?: { pitch: number; speed: number; warmth: number }
  ): Promise<Buffer> {
    // Try NVIDIA NIM
    if (config.nvidia.apiKey) {
      try {
        return await this.nvidiaTts(text, voiceParams);
      } catch (error) {
        console.warn('[TTS] NVIDIA failed:', error);
      }
    }

    throw new Error('No TTS provider available. Set NVIDIA_API_KEY in .env');
  }

  private static async nvidiaTts(
    text: string,
    voiceParams?: { pitch: number; speed: number; warmth: number }
  ): Promise<Buffer> {
    const response = await axios.post(
      `${config.nvidia.baseUrl}/audio/speech`,
      {
        model: 'nvidia/fastpitch-hifigan-tts',
        input: text,
        voice: 'en-US',
        speed: voiceParams?.speed || 1.0,
        response_format: 'wav',
      },
      {
        headers: {
          Authorization: `Bearer ${config.nvidia.apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      }
    );

    return Buffer.from(response.data);
  }
}
