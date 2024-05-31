import React, { PureComponent } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import RNFS from 'react-native-fs';
import { ImageFilter } from 'react-native-image-filter-kit'; // Import ImageFilter from the library

/**
 * Component affiché lorsque la caméra n'est pas prête
 */
const PendingView = () => (
  <View style={styles.pendingView}>
    <Text>Waiting</Text>
  </View>
);

/**
 * Affiche une boîte de dialogue avec un titre et un message
 * @param {string} title - Le titre de la boîte de dialogue
 * @param {string} msg - Le message de la boîte de dialogue
 */
const DialogMessage = (title, msg) => {
  Alert.alert(title, msg, [{ text: "OK", onPress: () => console.log("OK Pressed") }]);
};

/**
 * Apply sepia filter to an image
 * @param {string} uri - Image URI
 * @returns {string} - Filtered image URI
 */
const applySepiaFilter = async (uri) => {
  // Implement filter logic using react-native-image-filter-kit or any other suitable library
  return uri; // Placeholder - replace with actual implementation
};

export class CameraVision extends PureComponent {
  state = {
    isRecording: false,
    flashMode: RNCamera.Constants.FlashMode.off,
    cameraType: RNCamera.Constants.Type.back,
    imageUri: null,
  };

  /**
   * Bascule entre les modes flash on et off
   */
  toggleFlash = () => {
    this.setState({
      flashMode: this.state.flashMode === RNCamera.Constants.FlashMode.on
        ? RNCamera.Constants.FlashMode.off
        : RNCamera.Constants.FlashMode.on,
    });
  };

  /**
   * Bascule entre la caméra avant et arrière
   */
  toggleCamera = () => {
    this.setState({
      cameraType: this.state.cameraType === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back,
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.preview}
          type={this.state.cameraType}
          flashMode={this.state.flashMode}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        >
          {({ camera, status }) => {
            if (status !== 'READY') return <PendingView />;
            return (
              <View style={styles.controlContainer}>
                <TouchableOpacity onPress={this.toggleFlash}>
                  <Text style={{ fontSize: 14, color: this.state.flashMode ? 'yellow' : '#fff' }}>Flash</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.takePicture(camera)}
                  onLongPress={() => this.startRecording(camera)}
                  onPressOut={() => this.stopRecording(camera)}
                  style={[
                    styles.capture,
                    { backgroundColor: this.state.isRecording ? 'red' : '#fff' },
                  ]}
                >
                  <Text style={{ fontSize: 14 }}> {this.state.isRecording ? 'Recording' : 'Photo'} </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.toggleCamera}>
                  <Text style={{ fontSize: 14, color: this.state.cameraType === RNCamera.Constants.Type.back ? '#fff' : 'red' }}>Change</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </RNCamera>
      </View>
    );
  }

  /**
   * Commence l'enregistrement d'une vidéo
   * @param {object} camera - L'objet caméra de RNCamera
   */
  startRecording = async (camera) => {
    const timestamp = Date.now();
    try {
      this.setState({ isRecording: true });
      const options = { quality: RNCamera.Constants.VideoQuality['480p'], path: `${RNFS.ExternalDirectoryPath}/video_${timestamp}.mp4` };
      const data = await camera.recordAsync(options);
      console.log(`Video saved at: ${data.uri}`);
      setTimeout(() => { DialogMessage('Video', `Video saved at: ${data.uri}`) }, 1000);
      refreshStorage(options.path);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  /**
   * Arrête l'enregistrement d'une vidéo
   * @param {object} camera - L'objet caméra de RNCamera
   */
  stopRecording = (camera) => {
    if (this.state.isRecording) {
      camera.stopRecording();
      this.setState({ isRecording: false });
    }
  };

  /**
   * Prend une photo
   * @param {object} camera - L'objet caméra de RNCamera
   */
  takePicture = async (camera) => {
    const timestamp = Date.now();
    this.setState({ isRecording: false });
    const options = { quality: 0.5, base64: true, path: `${RNFS.ExternalDirectoryPath}/photo_${timestamp}.jpg` };
    const data = await camera.takePictureAsync(options);
    this.setState({ imageUri: data.uri });
    setTimeout(() => DialogMessage("Info", "Picture saved to: " + options.path), 1000);
    console.log(`Photo saved at: ${data.uri}`);
    refreshStorage(options.path);

    // Apply filter and save
    const filteredUri = await applySepiaFilter(data.uri);
    RNFS.writeFile(options.path, filteredUri, 'base64')
      .then(() => {
        console.log('Filtered photo saved');
      })
      .catch((err) => {
        console.error('Error saving filtered photo', err);
      });
  };
}

/**
 * Refreshes the storage to include the new file
 * @param {string} uri - URI of the file
 */
function refreshStorage(uri) {
  RNFS.scanFile([uri])
    .then(() => {
      console.log('Scanned photo file');
    })
    .catch((err) => {
      console.log('Cannot scan photo file', err);
    });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  controlContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingView: {
    flex: 1,
    backgroundColor: 'lightgreen',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraVision;
