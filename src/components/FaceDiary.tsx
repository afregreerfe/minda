import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Store as Stop, Play, RotateCcw, FileText, Loader, AlertCircle, Settings } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
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

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Video Recording Interface */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Permission Error State */}
          {cameraPermissionDenied && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Camera Permission Required</h3>
                  <p className="text-sm text-red-700 mb-4">
                    {permissionError || 'Face Diary needs camera access to record and analyze your expressions. This helps provide personalized mental health insights.'}
                  </p>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={retryPermission}
                      disabled={isCheckingPermission}
                      className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                    >
                      {isCheckingPermission ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          <span>Checking Permission...</span>
                        </>
                      ) : (
                        <>
                          <Camera size={16} />
                          <span>Grant Camera Permission</span>
                        </>
                      )}
                    </button>
                    {Capacitor.isNativePlatform() && (
                      <button
                        onClick={openAppSettings}
                        className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Settings size={16} />
                        <span>Open App Settings</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isCheckingPermission && !cameraPermissionDenied && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-center space-x-3">
                <Loader size={24} className="text-blue-600 animate-spin" />
                <span className="text-blue-800 font-medium">Requesting camera permission...</span>
              </div>
            </div>
          )}

          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-64 bg-gray-900 rounded-lg object-cover ${
                cameraPermissionDenied ? 'opacity-50' : ''
              }`}
            />
            
            {/* Camera Blocked Overlay */}
            {cameraPermissionDenied && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Camera size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Camera Access Required</p>
                </div>
              </div>
            )}
            
            {/* Countdown Overlay */}
            {countdown > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={countdown > 0 || cameraPermissionDenied || isCheckingPermission}
                    className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300"
                  >
                    <Video size={20} />
                <button
                  onClick={analyzeVideo}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                >
                  {isAnalyzing ? <Loader size={20} className="animate-spin" /> : <FileText size={20} />}
                  <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Video'}</span>
                </button>
                <button
                  onClick={resetRecording}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            )}
          </div>
        </div>