'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceRecorderProps {
  onPartialTranscript: (text: string) => void;
  onFinalTranscript: (record: any) => void;
  selectedLanguage: string;
}

export function useVoiceRecorder({
  onPartialTranscript,
  onFinalTranscript,
  selectedLanguage,
}: UseVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTextRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);

  const onPartialRef = useRef(onPartialTranscript);
  const onFinalRef = useRef(onFinalTranscript);
  useEffect(() => { onPartialRef.current = onPartialTranscript; }, [onPartialTranscript]);
  useEffect(() => { onFinalRef.current = onFinalTranscript; }, [onFinalTranscript]);

  const updateAudioMeter = useCallback(() => {
    if (!analyserRef.current) return;
    const array = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(array);

    let values = 0;
    for (let i = 0; i < array.length; i++) {
      values += array[i];
    }
    const average = values / array.length;
    setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));

    animationFrameRef.current = requestAnimationFrame(updateAudioMeter);
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    accumulatedTextRef.current = '';
    setRecordingDuration(0);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Audio recording is not supported in this browser environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      updateAudioMeter();

      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);

      // Browser SpeechRecognition for live text
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang =
          selectedLanguage === 'Hinglish' ? 'en-IN' :
          selectedLanguage === 'Hindi' ? 'hi-IN' :
          selectedLanguage === 'Marathi' ? 'mr-IN' :
          selectedLanguage === 'Tamil' ? 'ta-IN' :
          selectedLanguage === 'Bengali' ? 'bn-IN' :
          selectedLanguage === 'Telugu' ? 'te-IN' :
          selectedLanguage === 'English' ? 'en-US' :
          'en-IN';

        recognition.onresult = (event: any) => {
          let interim = '';
          let finalStr = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalStr += event.results[i][0].transcript + ' ';
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          const combined = (finalStr + interim).trim();
          accumulatedTextRef.current = combined;
          onPartialRef.current(combined);
        };

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.warn('SpeechRecognition error:', event.error);
          }
        };

        recognition.start();
      } else {
        setErrorMessage('Speech Recognition is not supported. Please use Chrome or Edge.');
      }

      setIsRecording(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
      } else {
        setErrorMessage(`Microphone error: ${err.message || 'Unable to access audio input.'}`);
      }
      setIsRecording(false);
    }
  }, [selectedLanguage, updateAudioMeter]);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setAudioLevel(0);
    setIsRecording(false);

    const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const capturedText = accumulatedTextRef.current.trim();

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }

    const textToSave = capturedText || '(No speech detected)';
    try {
      const res = await fetch('/api/transcriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSave,
          language: selectedLanguage,
          duration_s: duration,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        onFinalRef.current(saved);
      }
    } catch (e) {
      console.error('Failed to save transcript:', e);
    }
  }, [selectedLanguage]);

  return {
    isRecording,
    recordingDuration,
    audioLevel,
    errorMessage,
    startRecording,
    stopRecording,
    setErrorMessage,
  };
}
