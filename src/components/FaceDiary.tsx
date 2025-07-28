import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Store as Stop, Play, RotateCcw, FileText, Loader } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { FaceDiaryEntry } from '../types';
import { storage } from '../utils/storage';
import { faceAnalyzer, EmotionAnalysis } from '../utils/faceAnalysis';
import { useCamera, useHaptics, usePermissions } from '../hooks/useCapacitor';

  const startCamera = async () => {
    try {
      // Check and request camera permission on native platforms
      if (Capacitor.isNativePlatform()) {
        const hasPermission = await checkCameraPermission();
        if (!hasPermission) {
          const granted = await requestCameraPermission();
          if (!granted) {
            console.error('Camera permission denied');
            return;
          }
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
    }
  }