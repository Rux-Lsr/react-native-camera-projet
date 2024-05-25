import React, { PureComponent } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import RNFS from 'react-native-fs';

export const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text>Waiting</Text>
  </View>
);

export class CameraVision extends PureComponent {
  state = {
    isRecording: false,
    flashMode: RNCamera.Constants.FlashMode.off,
  };

  toggleFlash = () => {
    this.setState({
      flashMode: this.state.flashMode === RNCamera.Constants.FlashMode.on
        ? RNCamera.Constants.FlashMode.off
        : RNCamera.Constants.FlashMode.on,
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={this.state.flashMode}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Oky',
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
              <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={this.toggleFlash} style={styles.flash}>
                  <Text style={{ fontSize: 14, color: this.state.flashMode?'#fff':'yellow' }}>Flash</Text>
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
                  <Text style={{ fontSize: 14 }}> {this.state.isRecording ? 'recording' : 'photo'} </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </RNCamera>
      </View>
    );
  }
  startRecording = async (camera) => {
    const timestamp = Date.now();
    try {
      this.setState({ isRecording: true });
      const options = { quality: RNCamera.Constants.VideoQuality['480p'], path: `${RNFS.ExternalDirectoryPath}/video_${timestamp}.mp4` };
      const data = await camera.recordAsync(options);
      console.log(`Video saved at: ${data.uri}`);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };
  

  stopRecording = (camera) => {
    if (this.state.isRecording) {
      camera.stopRecording();
      this.setState({ isRecording: false });
    }
  };
  
  takePicture = async function (camera) {
    const timestamp = Date.now();
    this.state.isRecording =false
    const options = { quality: 0.5, base64: true, path: `${RNFS.ExternalDirectoryPath}/photo_${timestamp}.jpg` };
    const data = await camera.takePictureAsync(options);
    console.log(`Photo saved at: ${data.uri}`);
  };
  
}

export const styles = StyleSheet.create({
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
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 50,  // Bordures arrondies pour créer un cercle
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
    width: 100,  // Largeur fixe
    height: 100,  // Hauteur fixe
    justifyContent: 'center',  // Centrer le texte à l'intérieur du bouton
    alignItems: 'center',  // Centrer le texte à l'intérieur du bouton
  },
  
});
