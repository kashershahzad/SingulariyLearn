import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Text, Platform, Alert, Linking } from 'react-native';
import ImageFast from '../../../../components/ImageFast';
import { Images } from '../../../../assets/images';
import { openCamera, openPicker } from 'react-native-image-crop-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiRequestMultiMedia } from '../../../../services/ApiRequest';
import { useSelector } from 'react-redux';

const ProfileImagePicker = ({ imageUri, onImageSelected, uploadimage }) => {
  const token = useSelector(state => state.authConfig.token);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const insets = useSafeAreaInsets();

  const uploadImageToServer = async image => {
    try {
      setIsUploading(true);
      const uri = typeof image === 'string' ? image : image.path;
      const mime = typeof image === 'string' ? 'image/jpeg' : image.mime || 'image/jpeg';
      const name =
        typeof image === 'string'
          ? 'profile_image.jpg'
          : image.filename ||
            (mime.includes('png') ? 'profile_image.png' : 'profile_image.jpg');
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: mime,
        name,
      });
      formData.append('type', 'upload_data');
      formData.append('uploadtype', 'image');
      formData.append('user_id', token);

      const response = await ApiRequestMultiMedia(formData);
      console.log('Upload successful:', response.data);
      console.log('Uploaded Image URL:', response.data.url);
      uploadimage(response.data.url);
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const isCameraUnavailableError = (err) => {
    const msg = err?.message ?? '';
    return (
      msg.includes('simulator') ||
      msg.includes('Cannot run camera') ||
      msg.includes('camera') && msg.toLowerCase().includes('not available')
    );
  };

  const isPermissionDeniedError = (err) => {
    const msg = (err?.message ?? '').toLowerCase();
    return (
      msg.includes('did not grant') ||
      msg.includes('permission') && (msg.includes('denied') || msg.includes('library'))
    );
  };

  const handleImagePick = async (type) => {
    try {
      let image;
      const pickerOptions = {
        mediaType: 'photo',
        cropping: false,
        compressImageQuality: 1,
      };
           // image = await openCamera({
        //   width: 300,
        //   height: 300,
        //   cropping: true,
        //   cropperCircleOverlay: true,
        //   mediaType: 'photo',
        // });
      if (type === 'camera') {
   
        image = await openCamera(pickerOptions);
      } else {
        image = await openPicker(pickerOptions);
      }
      onImageSelected(image.path);
      await uploadImageToServer(image);
      setIsModalVisible(false);
    } catch (error) {
      console.log('Image picker error:', error);
      if (error.message === 'User cancelled image selection') {
        setIsModalVisible(false);
        return;
      }
      if (isCameraUnavailableError(error)) {
        Alert.alert(
          'Camera not available',
          "Camera isn't available on simulator. Please use 'Choose from Gallery' to pick a photo.",
          [{ text: 'OK' }]
        );
        // Keep modal open so user can tap "Choose from Gallery"
        return;
      }
      if (isPermissionDeniedError(error)) {
        Alert.alert(
          'Photo access needed',
          'To choose a profile photo, please allow access to your photo library in Settings.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsModalVisible(false) },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      Alert.alert('Error', 'Failed to process image');
      setIsModalVisible(false);
    }
  };

  const showImagePickerOptions = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={showImagePickerOptions} disabled={isUploading}>
        <ImageFast
          source={imageUri && imageUri !== "" ? { uri: imageUri } : Images.placeholderUser}
          resizeMode={'contain'}
          style={[styles.profileImage, isUploading && styles.uploadingImage]}
        />
        <ImageFast
          source={Images.edit}
          resizeMode={'contain'}
          style={styles.editIcon}
        />
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeModal}
        >
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 16 }]}>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => handleImagePick('camera')}
              disabled={isUploading}
            >
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => handleImagePick('gallery')}
              disabled={isUploading}
            >
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={closeModal}
              disabled={isUploading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  profileImage: {
    width: 107,
    height: 107,
    borderRadius: 53.5,
  },
  editIcon: {
    width: 23,
    height: 23,
    position: 'absolute',
    bottom: 0,
    right: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  optionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
    fontWeight: '600',
  },
  uploadingImage: {
    opacity: 0.7,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 53.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileImagePicker;