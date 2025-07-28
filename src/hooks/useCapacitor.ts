return { setStyle, setBackgroundColor, hide, show };
};

// Hook for permissions
export const usePermissions = () => {
  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      if (!Capacitor.isNativePlatform()) {
        return true; // Web doesn't need explicit permission check
      }

      const permission = await Camera.checkPermissions();
      return permission.camera === 'granted';
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return false;
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      if (!Capacitor.isNativePlatform()) {
        return true; // Web handles permissions automatically
      }

      const permission = await Camera.requestPermissions();
      return permission.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      if (!Capacitor.isNativePlatform()) {
        return true;
      }

      const permission = await Camera.checkPermissions();
      return permission.photos === 'granted'; // Using photos as proxy for media access
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return false;
    }
  };

  return { 
    checkCameraPermission, 
    requestCameraPermission, 
    checkMicrophonePermission 
  };
};
// Hook for permissions
export const usePermissions = () => {
  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      if (!Capacitor.isNativePlatform()) {
        return true; // Web doesn't need explicit permission check
      }

      const permission = await Camera.checkPermissions();
      return permission.camera === 'granted';
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return false;
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      if (!Capacitor.isNativePlatform()) {
        return true; // Web handles permissions automatically
      }

      const permission = await Camera.requestPermissions();
      return permission.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  return { checkCameraPermission, requestCameraPermission };
};