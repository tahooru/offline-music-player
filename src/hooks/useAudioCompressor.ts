"use client";

import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export function useAudioCompressor() {
  const [isReady, setIsReady] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  const load = useCallback(async () => {
    if (isReady) return;
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setIsReady(true);
  }, [isReady]);

  const compressAudio = useCallback(async (
    file: File | Blob, 
    onProgress?: (progress: number) => void
  ): Promise<Blob> => {
    if (!isReady) await load();
    
    setIsCompressing(true);
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('progress', ({ progress }) => {
      if (onProgress) onProgress(Math.round(progress * 100));
    });

    const inputName = 'input.audio';
    const outputName = 'output.mp3';

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Compress to 64k bitrate
    await ffmpeg.exec(['-i', inputName, '-b:a', '64k', outputName]);

    const fileData = await ffmpeg.readFile(outputName);
    const data = fileData as Uint8Array;
    
    setIsCompressing(false);
    return new Blob([data.buffer], { type: 'audio/mp3' });
  }, [isReady, load]);

  return { compressAudio, isReady, load, isCompressing };
}
