import React, { PureComponent } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import RNFS from 'react-native-fs';
const icons ={
  flash :  require('./flash.png'),
  camera_switch:  require('./camera_switch.png')
}
/**
 * Component affiché lorsque la caméra n'est pas prête
 */
 const PendingView = () => (
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

/**
 * Affiche une boîte de dialogue avec un titre et un message
 * @param {string} title - Le titre de la boîte de dialogue
 * @param {string} msg - Le message de la boîte de dialogue
 */
const DialogMessage = (title : string, msg : string) => {
  Alert.alert(
    title,
    msg,
    [
      { text: "OK", onPress: () => console.log("OK Pressed") }
    ]
  );
}


export class CameraVision extends PureComponent {
  state = {
    isRecording: false,
    flashMode: RNCamera.Constants.FlashMode.off,
    cameraType: RNCamera.Constants.Type.back
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
  toggleCamera = () => { // Ajoutez une nouvelle fonction pour basculer le type de caméra
    this.setState({
      cameraType: this.state.cameraType === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back,
    });
  };

  render() {
    return (
      //Interface d'affichage 
      <View style={styles.container}>
        <RNCamera
          style={styles.preview}
          type={this.state.cameraType} // Utilisez l'état cameraType pour définir le type de caméra
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
              <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
                {/* gerer le flash de la camera */}
                <TouchableOpacity onPress={this.toggleFlash}>
                  <View style={{backgroundColor:this.state.flashMode? 'rgba(255, 255, 0, 0.5)':'transparent', flexDirection:'row', justifyContent:this.state.flashMode?'flex-end':'',borderRadius:10, width:40,}}><Image source={icons.flash} style={[styles.icon]}/></View>
                </TouchableOpacity>

                {/* Gerer la capture */}

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

                  {/* Changer le type de camera */}

                <TouchableOpacity onPress={this.toggleCamera}>
                  <View style={{backgroundColor:this.state.cameraType? 'rgba(0, 0, 150, 0.5)':'transparent', flexDirection:'row', justifyContent:this.state.cameraType?'flex-end':'',borderRadius:10, width:40,}}><Image source={icons.camera_switch} style={styles.icon}/></View>
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
      setTimeout(()=>{DialogMessage('Video', `Video saved at: ${data.uri}`)}, 1000)
      refreshStorage(options.path)

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
  takePicture = async function (camera) {
    const timestamp = Date.now();
    this.state.isRecording =false
    const options = { 
      quality: 0.5, 
      base64: true, path: 
      `${RNFS.ExternalDirectoryPath}/photo_${timestamp}.jpg` 
    };
    
    const data = await camera.takePictureAsync(options);
    setTimeout(()=>DialogMessage("Info", "picture save to : "+options.path), 1000)
    console.log(`Photo saved at: ${data.uri}`);
    refreshStorage(options.path)
  };

}

function refreshStorage(uri:string): void{
  RNFS.scanFile(uri)
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
  icon:{
    width:20,
    height:30,
  }
});
