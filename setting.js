import React, { useState } from 'react';
import {
  View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, StatusBar,Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import adjust from './adjust';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const themes = [
  { key: 'light', label: 'Light', icon: 'sunny' },
  { key: 'dark', label: 'Dark', icon: 'moon' },
  { key: 'system', label: 'System Default', icon: 'desktop-outline' },
];

const Setting = ({
  isSoundOn, setIsSoundOn,
  isVibrationOn, setIsVibrationOn,
  stopOnTarget, setStopOnTarget,
  textToSpeech, setTextToSpeech,
  onBack,
  darkMode,
  theme = 'system', // current theme
  onThemeChange, // callback to change theme
}) => {
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const handleThemeSelect = (selectedTheme) => {
    setThemeModalVisible(false);
    if (onThemeChange) onThemeChange(selectedTheme);
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.containerDark]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={darkMode ? '#161d2a' : '#fff'}
      />
      <View style={[styles.headerRow, darkMode && { borderBottomColor: '#333' }]}>
        <Text style={[styles.headerText, darkMode && { color: '#fff' }]}>Settings</Text>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.closeButton}>
            <Icon name="close" size={26} color={darkMode ? '#fff' : '#003366'} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Select Theme */}
        <TouchableOpacity
          style={[styles.card, darkMode && styles.cardDark, styles.cardShadow]}
          activeOpacity={0.8}
          onPress={() => setThemeModalVisible(true)}
        >
          <View style={styles.cardLeft}>
            <Icon name="color-palette" size={22} color={darkMode ? '#fff' : '#4085d0'} style={styles.cardIcon} />
            <Text style={[styles.cardText, darkMode && styles.textDark]}>Select Theme</Text>
          </View>
          <Icon name="chevron-forward" size={22} color={darkMode ? '#aaa' : '#666'} />
        </TouchableOpacity>

        {/* Vibrate on target */}
        <View style={[styles.card, darkMode && styles.cardDark, styles.cardShadow]}>
          <View style={styles.cardLeft}>
            <Icon name="phone-portrait" size={22} color={darkMode ? '#fff' : '#4085d0'} style={styles.cardIcon} />
            <Text style={[styles.cardText, darkMode && styles.textDark]}>Vibrate on target</Text>
          </View>
          <Switch
            value={isVibrationOn}
            onValueChange={setIsVibrationOn}
            thumbColor={isVibrationOn ? '#4caf50' : '#ccc'}
            trackColor={{ false: '#bbb', true: '#a5d6a7' }}
          />
        </View>

        {/* Stop on target */}
        <View style={[styles.card, darkMode && styles.cardDark, styles.cardShadow]}>
          <View style={styles.cardLeft}>
            <Icon name="hand-left" size={22} color={darkMode ? '#fff' : '#4085d0'} style={styles.cardIcon} />
            <Text style={[styles.cardText, darkMode && styles.textDark]}>Stop on target</Text>
          </View>
          <Switch
            value={stopOnTarget}
            onValueChange={setStopOnTarget}
            thumbColor={stopOnTarget ? '#4caf50' : '#ccc'}
            trackColor={{ false: '#bbb', true: '#a5d6a7' }}
          />
        </View>

        {/* Clicking Sound */}
        <View style={[styles.card, darkMode && styles.cardDark, styles.cardShadow]}>
          <View style={styles.cardLeft}>
            <Icon name="volume-high" size={22} color={darkMode ? '#fff' : '#4085d0'} style={styles.cardIcon} />
            <Text style={[styles.cardText, darkMode && styles.textDark]}>Clicking Sound</Text>
          </View>
          <Switch
            value={isSoundOn}
            onValueChange={setIsSoundOn}
            thumbColor={isSoundOn ? '#4caf50' : '#ccc'}
            trackColor={{ false: '#bbb', true: '#a5d6a7' }}
          />
        </View>

        {/* Text to speech */}
        <View style={[styles.card, darkMode && styles.cardDark, styles.cardShadow]}>
          <View style={styles.cardLeft}>
            <Icon name="mic" size={22} color={darkMode ? '#fff' : '#4085d0'} style={styles.cardIcon} />
            <Text style={[styles.cardText, darkMode && styles.textDark]}>Text to speech</Text>
          </View>
          <Switch
            value={textToSpeech}
            onValueChange={setTextToSpeech}
            thumbColor={textToSpeech ? '#4caf50' : '#ccc'}
            trackColor={{ false: '#bbb', true: '#a5d6a7' }}
          />
        </View>

        {/* Terms & Conditions */}
        <TouchableOpacity style={[styles.card, darkMode && styles.cardDark, styles.cardShadow]} activeOpacity={0.8}>
          <View style={styles.cardLeft}>
            <Icon name="document-text" size={22} color={darkMode ? '#fff' : '#4085d0'} style={styles.cardIcon} />
            <Text style={[styles.cardText, darkMode && styles.textDark]}>Terms & Conditions</Text>
          </View>
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity style={[styles.card, darkMode && styles.cardDark, styles.cardShadow]} activeOpacity={0.8}>
          <View style={styles.cardLeft}>
            <Icon name="lock-closed" size={22} color={darkMode ? '#fff' : '#4085d0'} style={styles.cardIcon} />
            <Text style={[styles.cardText, darkMode && styles.textDark]}>Privacy Policy</Text>
          </View>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={[styles.card, darkMode && styles.cardDark, styles.cardShadow]} activeOpacity={0.8}>
          <View style={styles.cardLeft}>
            <Icon name="share-social" size={22} color={darkMode ? '#fff' : '#4085d0'} style={styles.cardIcon} />
            <Text style={[styles.cardText, darkMode && styles.textDark]}>Share</Text>
          </View>
        </TouchableOpacity>

        {/* Feedback */}
        <TouchableOpacity style={[styles.card, darkMode && styles.cardDark, styles.cardShadow]} activeOpacity={0.8}>
          <View style={styles.cardLeft}>
            <Icon name="chatbubble-ellipses" size={22} color={darkMode ? '#fff' : '#4085d0'} style={styles.cardIcon} />
            <Text style={[styles.cardText, darkMode && styles.textDark]}>Feedback</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed Bottom Navbar */}
      <View style={[ darkMode && { backgroundColor: '#161d2a' }]}>
        {/* Add your nav items here, e.g. icons or buttons */}
      </View>

      {/* Theme Selection Modal */}
      <Modal
        visible={themeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && styles.cardDark]}>
            <Text style={[styles.modalTitle, darkMode && styles.textDark]}>Select Theme</Text>
            {themes.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.themeOption,
                  theme === t.key && styles.themeOptionSelected,
                ]}
                onPress={() => handleThemeSelect(t.key)}
                activeOpacity={0.7}
              >
                <Icon
                  name={t.icon}
                  size={22}
                  color={theme === t.key ? '#4085d0' : darkMode ? '#fff' : '#666'}
                  style={{ marginRight: 14 }}
                />
                <Text style={[styles.themeOptionText, darkMode && styles.textDark]}>{t.label}</Text>
                {theme === t.key && (
                  <Icon name="checkmark" size={20} color="#4085d0" style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setThemeModalVisible(false)}
            >
              <Text style={[styles.modalCloseText, darkMode && styles.textDark]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#161d2a',
  },
  textDark: {
    color: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: adjust(16),
    paddingTop: adjust(40),
    paddingBottom: adjust(10),
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize:  SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    color: '#003366',
    flex: 1,
  },
  scrollContainer: {
    marginTop: adjust(0),
    paddingBottom: adjust(20),
    paddingHorizontal: adjust(0),
  },
  card: {
    backgroundColor: '#f9faff',
    borderRadius: adjust(12),
    paddingVertical: adjust(18),
    paddingHorizontal: adjust(22),
    marginBottom: adjust(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
    alignSelf: 'stretch',
    marginHorizontal: adjust(8), // Ensure no horizontal margin
  },
  cardDark: {
    backgroundColor: '#232b39',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: adjust(14),
  },
  closeButton: {
    padding: adjust(6),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: adjust(16),
    padding: adjust(24),
    width: '85%', // % stays as is!
    alignItems: 'stretch',
    elevation: 4,
  },
  modalTitle: {
    fontSize: adjust(18),
    fontWeight: '600',
    marginBottom: adjust(18),
    textAlign: 'center',
    color: '#003366',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: adjust(12),
    paddingHorizontal: adjust(6),
    borderRadius: adjust(8),
    marginBottom: adjust(6),
  },
  themeOptionSelected: {
    backgroundColor: '#e3f0ff',
  },
  themeOptionText: {
    fontSize: adjust(16),
    color: '#003366',
  },
  modalCloseBtn: {
    marginTop: adjust(16),
    alignSelf: 'center',
    paddingVertical: adjust(8),
    paddingHorizontal: adjust(24),
  },
  modalCloseText: {
    fontSize: adjust(16),
    color: '#4085d0',
  },
  themeLabel: {
    fontSize: adjust(15),
    marginRight: adjust(8),
    color: '#888',
  },
 
});

export default Setting;