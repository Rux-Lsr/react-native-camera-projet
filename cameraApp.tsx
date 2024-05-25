import React, { PureComponent } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

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
  };
  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
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
              <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity
                    onPressIn={() => this.startRecording(camera)}
                    onPressOut={() => this.stopRecording(camera)}
                    style={[
                      styles.capture,
                      { backgroundColor: this.state.isRecording ? 'red' : '#fff' },
                    ]}
                  >
                    <Text style={{ fontSize: 14 }}> SNAP </Text>
                  </TouchableOpacity>
              </View>
            );
          }}
        </RNCamera>
      </View>
    );
  }
  startRecording = async (camera) => {
    try {
      this.setState({ isRecording: true });
      const options = { quality: RNCamera.Constants.VideoQuality['480p'] };
      const data = await camera.recordAsync(options);
      console.log(data.uri);
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
    const options = { quality: 0.5, base64: true };
    const data = await camera.takePictureAsync(options);
    //  eslint-disable-next-line
    console.log(data.uri);
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
