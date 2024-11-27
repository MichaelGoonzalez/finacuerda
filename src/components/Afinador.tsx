'use client'
import { useEffect, useRef, useState } from 'react';

const Afinadorc = () => {
  const [frequency, setFrequency] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStream | null>(null); 

  useEffect(() => {
    const getAudioStream = async () => {
      try {
        // Solicitar acceso al micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphoneRef.current = stream;
        
        // Crear un nuevo contexto de audio
        audioContextRef.current = new (window.AudioContext)();
        
        // Crear un AnalizerNode para analizar el audio
        analyserRef.current = audioContextRef.current.createAnalyser();
        
        // Conectar la fuente de micrófono al analizador
        const microphone = audioContextRef.current.createMediaStreamSource(stream);
        microphone.connect(analyserRef.current);
        
        analyserRef.current.fftSize = 2048;  // Tamaño del FFT
      } catch (err) {
        console.error('Error al acceder al micrófono: ', err);
      }
    };

    getAudioStream();

    return () => {
      // Detener el stream cuando el componente se desmonte
      if (microphoneRef.current) {
        microphoneRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Función para calcular la frecuencia dominante
  const getFrequency = () => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    let maxIndex = 0;
    for (let i = 1; i < bufferLength; i++) {
      if (dataArray[i] > dataArray[maxIndex]) {
        maxIndex = i;
      }
    }

    // Calcular la frecuencia
    const nyquist = audioContextRef.current.sampleRate / 2;
    const frequency = (maxIndex / bufferLength) * nyquist;

    setFrequency(frequency);
  };

  // Llamar a getFrequency cada vez que el componente se renderiza
  useEffect(() => {
    const interval = setInterval(() => {
      getFrequency();
    }, 100);

    return () => clearInterval(interval);
  }, []);


  const getNoteFromFrequency = (frequency: number | null): string | null => {
    if (!frequency) return null;
    
    const A4 = 440; // La frecuencia de la nota A4
    const noteIndex = Math.round(12 * Math.log(frequency / A4) / Math.log(2));
    const noteNames = [
      'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
    ];
    
    const note = noteNames[(noteIndex + 69) % 12];
    const octave = Math.floor((noteIndex + 69) / 12) - 1;
  
    return `${note}${octave}`;
  };

  return (
    <div>
  {frequency ? (
    <>
      <p>Frecuencia detectada: {frequency.toFixed(2)} Hz</p>
      <p>Nota: {getNoteFromFrequency(frequency)}</p>
    </>
  ) : (
    <p>Esperando entrada de audio...</p>
  )}
</div>

  );
};

export default Afinadorc;
