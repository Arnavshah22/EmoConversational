import { useCallback, useRef, useState } from 'react';

interface UseVoiceStreamReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  audioChunks: Blob[];
  getAudioBlob: () => Blob | null;
  error: string | null;
}

export function useVoiceStream(
  onAudioChunk?: (chunk: Blob) => void
): UseVoiceStreamReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioChunks([]);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          setAudioChunks([...chunks]);
          onAudioChunk?.(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setIsRecording(false);
      };

      mediaRecorder.start(250); // Send chunks every 250ms
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err: any) {
      setError(err.message || 'Failed to access microphone');
      setIsRecording(false);
    }
  }, [onAudioChunk]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    streamRef.current = null;
    setIsRecording(false);
  }, []);

  const getAudioBlob = useCallback((): Blob | null => {
    if (audioChunks.length === 0) return null;
    return new Blob(audioChunks, { type: 'audio/webm' });
  }, [audioChunks]);

  return { isRecording, startRecording, stopRecording, audioChunks, getAudioBlob, error };
}
