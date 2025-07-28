import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Store as Stop, Play, RotateCcw, FileText, Loader } from 'lucide-react';
import { FaceDiaryEntry } from '../types';
import { storage } from '../utils/storage';
import { faceAnalyzer, EmotionAnalysis } from '../utils/faceAnalysis';
import { useCamera, useHaptics } from '../hooks/useCapacitor';

const FaceDiary: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<EmotionAnalysis | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { takePhoto } = useCamera();
  const { impact } = useHaptics();
  
  const entries = storage.getFaceDiaryEntries();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && recordingTime > 0) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRecording, recordingTime]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          beginRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const beginRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setRecordedBlob(blob);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(30); // 30 seconds
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const analyzeVideo = async () => {
    if (!videoRef.current) return;

    setIsAnalyzing(true);
    
    try {
      const analysisResult = await faceAnalyzer.analyzeVideo(videoRef.current);
      setAnalysis(analysisResult);
      
      // Save to storage
      const entry: FaceDiaryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        videoBlob: recordedBlob || undefined,
        analysis: analysisResult
      };
      
      storage.saveFaceDiaryEntry(entry);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setAnalysis(null);
    setRecordingTime(0);
    startCamera();
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 70) return 'bg-green-50 border-green-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto p-4">
          <h1 className="text-xl font-bold text-gray-800">Face Diary</h1>
          <p className="text-sm text-gray-600">30-second video analysis</p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Video Recording Interface */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 bg-gray-900 rounded-lg object-cover"
            />
            
            {/* Countdown Overlay */}
            {countdown > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-6xl font-bold">{countdown}</div>
              </div>
            )}
            
            {/* Recording Timer */}
            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">{recordingTime}s</span>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            {!recordedBlob ? (
              <>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={countdown > 0}
                    className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300"
                  >
                    <Video size={20} />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    <Stop size={20} />
                    <span>Stop Recording</span>
                  </button>
                )}
              </>
            ) : (
              <div className="flex space-x-3">
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

        {/* Analysis Results */}
        {analysis && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Report</h3>
            
            {/* Overall Score */}
            <div className={`p-4 rounded-lg border-2 mb-6 ${getScoreBackground(analysis.overallScore)}`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}/100
                </div>
                <div className="text-sm text-gray-600">Wellbeing Score</div>
              </div>
            </div>

            {/* Dominant Emotion */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Dominant Emotion</h4>
              <div className="p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-800 font-medium">{analysis.dominantEmotion}</span>
              </div>
            </div>

            {/* Emotion Breakdown */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Emotion Analysis</h4>
              <div className="space-y-2">
                {Object.entries(analysis.emotions).map(([emotion, value]) => (
                  <div key={emotion} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{emotion}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Depression Indicators */}
            {analysis.depressionIndicators.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Depression Indicators</h4>
                <div className="space-y-2">
                  {analysis.depressionIndicators.map((indicator, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="text-sm text-yellow-800">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Behavioral Notes */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Behavioral Notes</h4>
              <div className="space-y-2">
                {analysis.behavioralNotes.map((note, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Previous Entries */}
        {entries.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Entries</h3>
            <div className="space-y-3">
              {entries.slice(-5).reverse().map((entry) => (
                <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">
                        {entry.analysis.dominantEmotion}
                      </div>
                      <div className="text-sm text-gray-600">
                        {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(entry.analysis.overallScore)}`}>
                      {entry.analysis.overallScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceDiary;