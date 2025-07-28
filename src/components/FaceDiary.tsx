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

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Permission Error */}
        {permissionError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800 mb-2">Camera Permission Required</h3>
                <p className="text-sm text-red-700 mb-3">{permissionError}</p>
                <button
                  onClick={startCamera}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Recording Interface */}
        <div className="bg-white rounded-xl shadow-md p-6">