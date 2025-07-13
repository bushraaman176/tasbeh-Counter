import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, TextInput, KeyboardAvoidingView,
  TouchableWithoutFeedback, Vibration, Dimensions, StatusBar, useColorScheme, Alert, ScrollView, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DhikrListScreen from './DhikrListScreen';
import Setting from './setting';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import adjust from './adjust';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_COUNT = 100000;
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const App = () => {
  const [count, setCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [dhikrText, setDhikrText] = useState();
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [newTarget, setNewTarget] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [customDhikrs, setCustomDhikrs] = useState([]);
  const [showCustomDhikrModal, setShowCustomDhikrModal] = useState(false);
  const [newCustomDhikrName, setNewCustomDhikrName] = useState('');
  const [previousState, setPreviousState] = useState(null);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isVibrationOn, setIsVibrationOn] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [textToSpeech, setTextToSpeech] = useState(false);
  const colorScheme = useColorScheme();
  const darkMode = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');
  const [showCounterName, setShowCounterName] = useState(true);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [customDhikrName, setCustomDhikrName] = useState('');
  const [stopOnTarget, setStopOnTarget] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const soundRef = useRef();
  const ttsTimeout = useRef(null); // Add ttsTimeout ref
  const targetInputRef = useRef(null);

  // Keep all your existing functions here
  const handleTap = async () => {
   
    if (stopOnTarget && targetCount > 0 && count >= targetCount) {
      Alert.alert(
        "",
        "Target completed",
        [{ text: "OK" }]
      );
      if (textToSpeech) {
        await Speech.stop();
        await Speech.speak("Target completed", {
          language: 'en',
          rate: 0.8
        });
      }
      return;
    }

    if (count >= MAX_COUNT) {
      return;
    }

    setPreviousState(prev => ({ ...prev, count }));
    const newCount = count + 1;
    setCount(newCount);

    // Play sound if enabled
    if (isSoundOn && soundRef.current) {
      try {
        await soundRef.current.replayAsync();
      } catch (e) { }
    }

    // Vibrate if enabled
    if (isVibrationOn) {
      Vibration.vibrate(150);
    }

    // Handle text-to-speech
    if (textToSpeech) {
      try {
        // Clear any pending speech
        if (ttsTimeout.current) {
          clearTimeout(ttsTimeout.current);
        }
        await Speech.stop();

        // Speak the new count after a short delay
        ttsTimeout.current = setTimeout(async () => {
          if (newCount === targetCount) {
            await Speech.speak(`${targetCount} completed!`, {
              language: 'en',
              rate: 0.8
            });
          } else {
            await Speech.speak(String(newCount), {
              language: 'en',
              rate: 0.8
            });
          }
        }, 200);
      } catch (error) {
        console.error('Error with text-to-speech:', error);
      }
    }

    // Check if target is reached after increment
    if (newCount === targetCount) {
      Alert.alert(
        "",
        "Target completed",
        [{ text: "OK" }]
      );
      if (textToSpeech) {
        try {
          await Speech.stop();
          await Speech.speak("Target completed", {
            language: 'en',
            rate: 0.8
          });
        } catch (error) {
          console.error('Error with completion speech:', error);
        }
      }
    }
  };

  const handleRefresh = () => {
    // Save current state before resetting
    setPreviousState({
      count,
      targetCount,
      dhikrText
    });
    
    // Reset all values
    setCount(0);
    setTargetCount(0);
    setDhikrText(undefined);
  };

  const handleUndo = () => {
    if (previousState !== null) {
      setCount(previousState.count);
      setTargetCount(previousState.targetCount);
      setDhikrText(previousState.dhikrText);
      setPreviousState(null);
    }
  };

  const handleStartDhikr = (dhikr) => {
    setDhikrText(dhikr.arabic);
    setTargetCount(prev => prev === 0 ? dhikr.count : prev);
    setCount(0);
  };

  const handleSaveFavorite = () => {
    if (showCounterName && (!dhikrText || dhikrText.trim() === '')) {
      setShowNamePrompt(true);
      return;
    }
    if (dhikrText && dhikrText.trim() !== '') {
      const existingIndex = favorites.findIndex(fav => fav.dhikr === dhikrText);
      if (existingIndex !== -1) {
        const updatedFavorites = [...favorites];
        updatedFavorites[existingIndex] = { dhikr: dhikrText, count, target: targetCount };
        setFavorites(updatedFavorites);
      } else {
        setFavorites([...favorites, { dhikr: dhikrText, count, target: targetCount }]);
      }
      Alert.alert(
        'Saved', 
        `"${dhikrText}" saved at ${count}/${targetCount || 'No Target'}`, 
        [{ text: 'OK' }]
      );
    }
  };

  // Create screen components that use the shared state
  const CounterScreen = () => {
  return (
    <>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={darkMode ? '#161d2a' : '#eef5ff'} />
      <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
        {/* Saved Message */}
        {showSavedMessage && (
          <View style={{ position: 'absolute', top: 30, alignSelf: 'center', backgroundColor: darkMode ? '#232b39' : '#e0ffe0', padding: 12, borderRadius: 10, zIndex: 10 }}>
            <Text style={{ color: darkMode ? '#fff' : '#007700', fontWeight: 'bold', fontSize: 16 }}>Saved!</Text>
          </View>
        )}

        {/* Name Prompt Modal */}
        <Modal
          visible={showNamePrompt}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNamePrompt(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>Enter Dhikr Name</Text>
              <TextInput
                value={customDhikrName}
                onChangeText={setCustomDhikrName}
                placeholder="Dhikr name"
                placeholderTextColor={darkMode ? '#aaa' : '#888'}
                style={[styles.modalInput, darkMode && styles.modalInputDark]}
                  autoFocus={true}
                  returnKeyType="done"
                  blurOnSubmit={false}
              />
              <View style={[styles.modalButtons, { backgroundColor: 'transparent', justifyContent: 'flex-end', borderColor: darkMode ? '#555' : '#ccc' }]}>
                <TouchableOpacity
                  style={{ backgroundColor: 'transparent', paddingHorizontal: 0, marginRight: 16 }}
                  onPress={() => {
                    if (!customDhikrName || customDhikrName.trim().length < 2) {
                      Alert.alert(
                        "Invalid Name",
                        "Please enter at least 2 characters for the dhikr name",
                        [{ text: "OK" }]
                      );
                      return;
                    }
                      const existingIndex = favorites.findIndex(fav => fav.dhikr === customDhikrName);
                      if (existingIndex !== -1) {
                        const updatedFavorites = [...favorites];
                        updatedFavorites[existingIndex] = { dhikr: customDhikrName, count, target: targetCount };
                        setFavorites(updatedFavorites);
                      } else {
                        setFavorites([...favorites, { dhikr: customDhikrName, count, target: targetCount }]);
                      }
                      setDhikrText(customDhikrName);
                      setShowNamePrompt(false);
                      setCustomDhikrName('');
                    // Show success message
                    Alert.alert(
                      "Success",
                      "Dhikr name has been saved",
                      [{ text: "OK" }]
                    );
                  }}
                >
                    <Text style={{ color: darkMode ? '#fff' : '#003366', fontSize: 16, padding: 6 }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: 'transparent', paddingHorizontal: 0 }}
                  onPress={() => {
                    setShowNamePrompt(false);
                    setCustomDhikrName('');
                  }}
                >
                    <Text style={{ color: darkMode ? '#fff' : '#003366', fontSize: 16, padding: 6}}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Target Modal */}
        <Modal
          visible={showTargetModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowTargetModal(false);
            setNewTarget('');
            Keyboard.dismiss();
          }}
          onShow={() => {
            // Focus the input after modal appears
            setTimeout(() => {
              targetInputRef.current?.focus();
            }, 300);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>Set Target Count</Text>
              <TextInput
                ref={targetInputRef}
                value={newTarget}
                onChangeText={setNewTarget}
                placeholder="Enter target count"
                keyboardType="numeric"
                placeholderTextColor={darkMode ? "#aaa" : "#888"}
                style={[styles.modalInput, darkMode && styles.modalInputDark]}
                returnKeyType="done"
                blurOnSubmit={false}
                onFocus={() => {
                  // Ensure keyboard stays open
                  setTimeout(() => {
                    targetInputRef.current?.focus();
                  }, 100);
                }}
                onBlur={() => {
                  // Prevent unwanted blur
                  if (showTargetModal) {
                    setTimeout(() => {
                      targetInputRef.current?.focus();
                    }, 100);
                  }
                }}
              />
              <View style={[styles.modalButtons, { backgroundColor: 'transparent', justifyContent: 'flex-end', borderColor: darkMode ? '#555' : '#ccc' }]}>
                <TouchableOpacity
                  style={{ backgroundColor: 'transparent', paddingHorizontal: 0, marginRight: 16 }}
                  onPress={() => {
                    // Validate empty input
                    if (!newTarget || newTarget.trim() === '') {
                      Alert.alert(
                        "Empty Target",
                        "Please enter a target count first",
                        [{ text: "OK" }]
                      );
                      return;
                    }

                    // Validate numeric input
                    const num = parseInt(newTarget);
                    if (isNaN(num) || !Number.isInteger(Number(newTarget))) {
                      Alert.alert(
                        "Invalid Target",
                        "Please enter a valid whole number",
                        [{ text: "OK" }]
                      );
                      return;
                    }

                    // Validate range
                    if (num <= 0) {
                      Alert.alert(
                        "Invalid Target",
                        "Target count must be greater than 0",
                        [{ text: "OK" }]
                      );
                      return;
                    }

                    if (num > MAX_COUNT) {
                      Alert.alert(
                        "Invalid Target",
                        `Target count cannot exceed ${MAX_COUNT}`,
                        [{ text: "OK" }]
                      );
                      return;
                    }

                    // Validate against current count
                    if (num <= count) {
                      Alert.alert(
                        "Invalid Target",
                        `Target count must be greater than current count (${count})`,
                        [{ text: "OK" }]
                      );
                      return;
                    }

                    // Set target and show success message
                    setTargetCount(num);
                    setShowTargetModal(false);
                    setNewTarget('');
                    Keyboard.dismiss();
                    Alert.alert(
                      "Success",
                      `Target count set to ${num}`,
                      [{ text: "OK" }]
                    );
                  }}
                >
                  <Text style={{ color: darkMode ? '#fff' : '#003366', fontSize: 16, padding: 6 }}>Set</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ paddingHorizontal: 0 }}
                  onPress={() => {
                    setShowTargetModal(false);
                    setNewTarget('');
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={{ color: darkMode ? '#fff' : '#003366', fontSize: 16, padding: 6 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

          {/* Custom Alert Modal */}
        <Modal
          visible={customAlertVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCustomAlertVisible(false)}
        >
          <View style={styles.customAlertOverlay}>
            <View style={[styles.customAlertBox, darkMode && styles.customAlertBoxDark]}>
              <Text style={[styles.customAlertText, darkMode && { color: '#fff' }]}>First enter the name</Text>
              <TouchableOpacity
                style={styles.customAlertButton}
                onPress={() => setCustomAlertVisible(false)}
              >
                  <Text style={styles.customAlertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Target Count */}
        <Text style={[styles.targetCount, darkMode && styles.textDark]}>{count} / {targetCount}</Text>
        <Text style={[styles.targetLabel, darkMode && styles.textDark]}>Target Count</Text>
        <Text style={[styles.dhikr, darkMode && styles.textDark]}>{dhikrText}</Text>

        {/* Counter */}
        <View style={[styles.counterCircle, darkMode && styles.counterCircleDark]}>
          <View style={styles.innerCircle}>
            <Text style={[styles.counterText, darkMode && styles.textDark]}>{count}</Text>
          </View>
        </View>

        {/* Tap Button Row */}
        <View style={styles.tapRow}>
          <View style={styles.sideButtonsContainer}>
            <TouchableOpacity
              style={styles.sideIconButton}
              onPress={handleRefresh}
            >
              <Icon name="refresh" size={26} color={darkMode ? "#fff" : "#666666"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sideIconButton, { marginTop: 10 }]}
              onPress={handleUndo}
            >
              <Icon 
                name="arrow-undo" 
                size={26} 
                color={darkMode ? "#fff" : "#666666"}
              />
            </TouchableOpacity>
          </View>
          {darkMode ? (
           <LinearGradient
             colors={["#0f8073", "#0490a0"]}
             style={styles.tapButton}
             start={{ x: 0, y: 0 }}
             end={{ x: 1, y: 1 }}
           >
             <TouchableOpacity
               style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
               onPress={handleTap}
               activeOpacity={0.8}
             >
               <Text style={styles.tapText}>TAP</Text>
             </TouchableOpacity>
           </LinearGradient>
          ) : (
            <TouchableOpacity
              style={styles.tapButton}
              onPress={handleTap}
              activeOpacity={0.8}
            >
              <Text style={styles.tapText}>TAP</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.sideIconButton}
            onPress={handleSaveFavorite}
          >
            <Icon name="save" size={26} color={darkMode ? "#fff" : "#666666"} />
          </TouchableOpacity>
        </View>

        {/* Action Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Icon name={darkMode ? "sunny" : "moon"} size={26} color={darkMode ? "#fff" : "#666666"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSoundOn((prev) => !prev)}>
            <Icon name={isSoundOn ? "volume-high" : "volume-mute"} size={26} color={darkMode ? "#fff" : "#666666"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsVibrationOn((prev) => !prev)}>
            <Icon name={isVibrationOn ? "phone-portrait" : "phone-portrait-outline"} size={26} color={darkMode ? "#fff" : "#666666"} />
          </TouchableOpacity>
          {darkMode ? (
            <LinearGradient
              colors={["#0f8073", "#0490a0"]}
              style={styles.setTargetButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                onPress={() => setShowTargetModal(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.setTargetText, { color: '#fff' }]}>Set Target</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <TouchableOpacity
              style={styles.setTargetButton}
              onPress={() => setShowTargetModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.setTargetText}>Set Target</Text>
            </TouchableOpacity>
          )}
        </View>
        </SafeAreaView>
      </>
    );
  };

  const FavoritesScreen = () => {
    return (
      <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.favoritesHeader, darkMode && styles.textDark, { marginLeft: adjust(0), marginRight: adjust(0), textAlign: 'left', flex: 1 }]}>Favorite</Text>
          </View>

        {favorites.length === 0 ? (
          <Text style={[styles.emptyFavoritesText, darkMode && styles.textDark]}>No favorites saved yet.</Text>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ marginBottom: adjust(20) }}>
            {favorites.map((item, index) => {
              const isEnglish = /^[\u0000-\u007F\s.,!?()\-']+$/.test(item.dhikr);
              return (
                <View
                  key={item.dhikr + index}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      borderRadius: adjust(12),
                      marginBottom: adjust(10),
                      paddingVertical: adjust(14),
                      paddingHorizontal: adjust(12),
                      minHeight: adjust(54),
                    },
                    darkMode && { backgroundColor: '#232b39' },
                  ]}
                >
                  {!isEnglish && (
                    <TouchableOpacity
                      onPress={() => {
                        setFavorites(favorites.filter((fav, i) => i !== index));
                      }}
                      style={{ marginRight: adjust(10), padding: adjust(8) }}
                    >
                      <Icon name="trash-outline" size={22} color={darkMode ? '#fff' : '#FF0000'} />
            </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={{ flex: 1, alignItems: isEnglish ? 'flex-start' : 'flex-end' }}
                    onPress={() => {
                      setDhikrText(item.dhikr);
                      setCount(item.count);
                      setTargetCount(item.target);
                    }}
                  >
                    <Text style={{ fontSize: adjust(16), color: darkMode ? '#fff' : '#333', textAlign: isEnglish ? 'left' : 'right' }}>{item.dhikr}</Text>
                    <Text style={{ fontSize: adjust(15), color: darkMode ? '#aaa' : '#555', marginTop: adjust(2), textAlign: isEnglish ? 'left' : 'right' }}>({item.count}/{item.target})</Text>
            </TouchableOpacity>
                  {isEnglish && (
                    <TouchableOpacity
                      onPress={() => {
                        setFavorites(favorites.filter((fav, i) => i !== index));
                      }}
                      style={{ marginLeft: adjust(10), padding: adjust(8) }}
                    >
                      <Icon name="trash-outline" size={22} color={darkMode ? '#fff' : '#FF0000'} />
                    </TouchableOpacity>
                  )}
          </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  };

  const DhikrScreen = () => {
    return (
      <DhikrListScreen onStartDhikr={handleStartDhikr} />
    );
  };

  const SettingsScreen = () => {
    return (
      <Setting
        isSoundOn={isSoundOn}
        setIsSoundOn={setIsSoundOn}
        isVibrationOn={isVibrationOn}
        setIsVibrationOn={setIsVibrationOn}
        stopOnTarget={stopOnTarget}
        setStopOnTarget={setStopOnTarget}
        textToSpeech={textToSpeech}
        setTextToSpeech={setTextToSpeech}
        darkMode={darkMode}
        showCounterName={showCounterName}
        setShowCounterName={setShowCounterName}
        theme={theme}
        onThemeChange={setTheme}
        onBack={null} // Add this to prevent back button from showing
      />
    );
  };

  const MyListScreen = () => {
    const navigation = useNavigation();
    return (
      <SafeAreaView style={[styles.myListContainer, darkMode && styles.containerDark]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={darkMode ? '#161d2a' : '#eef5ff'} />
        <View style={[styles.headerRow, { width: '100%', justifyContent: 'space-between', marginBottom: 10 }]}>
          <Text style={[styles.headerText, darkMode && styles.textDark]}>My Dhikr List</Text>
          <TouchableOpacity
            onPress={() => setShowCustomDhikrModal(true)}
            style={styles.addButton}
          >
            <Icon name="add" size={24} color={darkMode ? '#fff' : '#003366'} />
            </TouchableOpacity>
          </View>

        <ScrollView style={{ width: '100%' }}>
          {customDhikrs.length === 0 ? (
            <Text style={[styles.emptyText, darkMode && styles.textDark]}>
              No custom dhikrs yet. Click + to add one.
            </Text>
          ) : (
            customDhikrs.map((dhikr, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.customDhikrItem, darkMode && styles.customDhikrItemDark]}
                onPress={() => {
                  setDhikrText(dhikr.name);
                  setCount(0);
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'MainTabs',
                        params: {
                          screen: 'Counter',
                          params: { timestamp: Date.now() }
                        }
                      }
                    ]
                  });
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.customDhikrName, darkMode && styles.textDark]}>{dhikr.name}</Text>
        </View>
                <TouchableOpacity
                  onPress={() => {
                    setCustomDhikrs(customDhikrs.filter((_, i) => i !== index));
                  }}
                  style={{ padding: 10 }}
                >
                  <Icon name="trash-outline" size={20} color={darkMode ? '#fff' : '#FF0000'} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <Modal
          visible={showCustomDhikrModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCustomDhikrModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>Add Custom Dhikr</Text>
              <TextInput
                value={newCustomDhikrName}
                onChangeText={setNewCustomDhikrName}
                placeholder="Enter dhikr name"
                placeholderTextColor={darkMode ? "#aaa" : "#888"}
                style={[styles.modalInput, darkMode && styles.modalInputDark]}
              />
              <View style={[styles.modalButtons, { backgroundColor: 'transparent', justifyContent: 'flex-end' }]}>
                <TouchableOpacity
                  style={{ marginRight: 16 }}
                  onPress={() => {
                    if (!newCustomDhikrName.trim()) {
                      Alert.alert('Error', 'Please enter a dhikr name');
                      return;
                    }
                    setCustomDhikrs([...customDhikrs, { name: newCustomDhikrName }]);
                    setNewCustomDhikrName('');
                    setShowCustomDhikrModal(false);
                  }}
                >
                  <Text style={{ color: darkMode ? '#fff' : '#003366', fontSize: 16, padding: 6 }}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowCustomDhikrModal(false);
                    setNewCustomDhikrName('');
                  }}
                >
                  <Text style={{ color: darkMode ? '#fff' : '#003366', fontSize: 16, padding: 6 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  };

  // Load sound on mount
  React.useEffect(() => {
    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/click.mp3')
      );
      soundRef.current = sound;
    })();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Add cleanup for text-to-speech
  useEffect(() => {
    return () => {
      if (ttsTimeout.current) {
        clearTimeout(ttsTimeout.current);
      }
      Speech.stop();
    };
  }, []);

  const TabNavigator = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Counter':
                iconName = focused ? 'finger-print' : 'finger-print-outline';
                break;
              case 'Favorites':
                iconName = focused ? 'star' : 'star-outline';
                break;
              case 'Dhikr':
                iconName = focused ? 'list' : 'list-outline';
                break;
              case 'Settings':
                iconName = focused ? 'settings' : 'settings-outline';
                break;
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: darkMode ? '#0490a0' : '#4085d0',
          tabBarInactiveTintColor: darkMode ? '#fff' : '#666666',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: darkMode ? '#161d2a' : '#eef5ff',
            borderTopColor: darkMode ? '#333' : '#e0e0e0',
            height: SCREEN_HEIGHT * 0.11,
            paddingBottom: adjust(8),
          },
          tabBarLabelStyle: {
            fontSize: adjust(12),
            marginTop: adjust(-5),
          },
        })}
      >
        <Tab.Screen name="Counter" component={CounterScreen} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} />
        <Tab.Screen name="Dhikr" component={DhikrScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    );
  };

  return (
    <NavigationContainer style={{flex:1}}>
     <Stack.Navigator screenOptions={{ headerShown: false }}>
       <Stack.Screen name="MainTabs" component={TabNavigator} />
       <Stack.Screen 
         name="My List" 
         component={MyListScreen}
         options={{
           headerShown: true,
           headerStyle: {
             backgroundColor: darkMode ? '#161d2a' : '#eef5ff',
           },
           headerTintColor: darkMode ? '#fff' : '#003366',
           headerTitleStyle: {
             fontWeight: 'bold',
           },
         }}
       />
     </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#eef5ff',
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingBottom: adjust(70), // Add padding for tab bar
  },
  containerDark: {
    backgroundColor: '#161d2a',
  },
  textDark: {
    color: '#fff',
  },
  targetCount: {
    fontSize: adjust(18),
    fontWeight: '500',
    color: '#222',
  },
  targetLabel: {
    fontSize: adjust(14),
    color: '#777',
    marginTop: adjust(2),
  },
  dhikr: {
    fontSize: adjust(20),
    color: '#003366',
    fontWeight: '600',
    marginVertical: adjust(6),
  },
  counterCircle: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    borderWidth: adjust(6),
    borderColor: '#fff',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.03,
    shadowColor: '#133241',
    shadowOffset: { width: 0, height: adjust(8) },
    shadowOpacity: 0.7,
    shadowRadius: adjust(40),
    elevation: adjust(16),
  },
  counterCircleDark: {
    backgroundColor: '#232b39',
    borderColor: 'transparent',
    shadowColor: '#4ED7F1',
    shadowOffset: { width: 0, height: adjust(8) },
    shadowOpacity: 0.7,
    shadowRadius: adjust(20),
    elevation: adjust(16),
  },
  innerCircle: {
    width: SCREEN_WIDTH * 0.56,
    height: SCREEN_WIDTH * 0.56,
    borderRadius: SCREEN_WIDTH * 0.28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: adjust(5),
    borderColor: '#dbe9f9',
  },
  counterText: {
    fontSize: adjust(SCREEN_WIDTH * 0.13),
    color: '#003366',
    fontWeight: '700',
  },
  tapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: adjust(20),
    width: '100%',
  },
  sideIconButton: {
    width: adjust(54),
    height: adjust(54),
    borderRadius: adjust(27),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: adjust(8),
  },
  tapButton: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: SCREEN_WIDTH * 0.3,
    backgroundColor: '#4085d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapButtonDark: {
    backgroundColor: '#0393a7',
  },
  tapText: {
    color: '#fff',
    fontSize: adjust(SCREEN_WIDTH * 0.055),
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SCREEN_HEIGHT * 0.025,
    width: '100%',
    paddingHorizontal: adjust(10),
  },
  setTargetButton: {
    backgroundColor: '#4085d0',
    borderRadius: adjust(20),
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: SCREEN_HEIGHT * 0.01,
  },
  setTargetText: {
    color: '#fff',
    fontSize: adjust(SCREEN_WIDTH * 0.035),
    fontWeight: '500',
  },
  favoritesHeader: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    margin: adjust(8),
    color: '#003366',
    
  },
  emptyFavoritesText: {
    color: '#888',
    textAlign: 'center',
    marginTop: adjust(50),
    fontSize: adjust(16),
  },
  favoritesList: {
    paddingHorizontal: adjust(16),
    paddingBottom: adjust(15),
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#f9faff',
    borderRadius: adjust(8),
    padding: adjust(10),
    minHeight: adjust(64),
    marginBottom: adjust(10),
    borderWidth: adjust(1),
    borderColor: '#e0e7ff',
  },
  favoriteItemDark: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  favoriteTextContainer: {
    flex: 1,
  },
  favoriteDhikrText: {
    fontSize: adjust(18),
    color: '#003366',
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  favoriteCountText: {
    fontSize: adjust(16),
    color: '#555',
  },
  deleteButton: {
    marginLeft: adjust(16),
    padding: adjust(8),
  },
  backButton: {
    marginTop: adjust(20),
    padding: adjust(12),
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#2979FF',
    fontSize: adjust(16),
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: adjust(24),
    borderRadius: adjust(12),
    width: adjust(280),
  },
  modalContentDark: {
    backgroundColor: '#333',
  },
  modalTitle: {
    fontSize: adjust(18),
    fontWeight: 'bold',
    marginBottom: adjust(12),
    color: '#003366',
  },
  modalInput: {
    borderWidth: adjust(1),
    borderColor: '#ccc',
    borderRadius: adjust(8),
    padding: adjust(8),
    marginBottom: adjust(16),
    color: '#000',
  },
  modalInputDark: {
    borderColor: '#555',
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: adjust(10),
  },
  customAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customAlertBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
  customAlertBoxDark: {
    backgroundColor: '#232b39',
  },
  customAlertText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  customAlertButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#4085d0',
    borderRadius: 4,
  },
  customAlertButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  input: {
    borderWidth: adjust(1),
    borderColor: '#ccc',
    borderRadius: adjust(8),
    padding: adjust(10),
    marginBottom: adjust(16),
    color: '#000',
    width: SCREEN_WIDTH * 0.8,
    fontSize: adjust(18),
  },
  inputDark: {
    borderColor: '#555',
    color: '#fff',
  },
  modalButton: {
    paddingVertical: adjust(10),
    paddingHorizontal: adjust(20),
    borderRadius: adjust(8),
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginRight: adjust(10),
  },
  saveButton: {
    backgroundColor: '#4085d0',
  },
  buttonText: {
    color: '#000',
    fontSize: adjust(16),
    fontWeight: '500',
  },
 
  bottomNavDark: {
    backgroundColor: '#161d2a',
    borderTopColor: '#333',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: adjust(6),
  },
  activeNavItem: {
    backgroundColor: 'rgba(64, 133, 208, 0.1)',
  },
  navText: {
    fontSize: adjust(12),
    color: '#666666',
    marginTop: adjust(4),
    textAlign: 'center',
  },
  navTextDark: {
    color: '#fff',
  },
  activeNavText: {
    color: darkMode => darkMode ? '#0490a0' : '#4085d0',
    fontWeight: '600',
  },
  sideButtonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    // alignItems: 'center',
    // paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  headerText: {
    fontSize: adjust(20),
    fontWeight: 'bold',
    color: '#003366',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: adjust(16),
    color: '#666',
    marginTop: 40,
  },
  customDhikrItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  customDhikrItemDark: {
    backgroundColor: '#232b39',
    borderColor: '#333',
  },
  customDhikrName: {
    fontSize: adjust(18),
    color: '#003366',
    marginBottom: 4,
  },
  customDhikrTarget: {
    fontSize: adjust(14),
    color: '#666',
  },
  myListContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#eef5ff',
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingBottom: adjust(70),
  },
});

export default App;