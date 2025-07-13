import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import adjust from './adjust';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const dhikrData = [
  {
    category: 'For Peace & Calm',
    items: [
      {
        arabic: 'سبحان الله',
        meaning: 'Glory be to Allah',
        why: 'Clear the mind and gain peace.',
        count: 100,
      },
      {
        arabic: 'الحمد لله',
        meaning: 'All praise is due to Allah',
        why: 'Cultivate gratitude.',
        count: 100,
      },
    ],
  },
  {
    category: 'For Forgiveness',
    items: [
      {
        arabic: 'أستغفر الله',
        meaning: 'I seek forgiveness from Allah',
        why: 'Cleanse the soul and receive mercy.',
        count: 100,
      },
    ],
  },
  {
    category: 'For Gratitude',
    items: [
      {
        arabic: 'سبحان الله وبحمده',
        meaning: 'Glory be to Allah and Praise be to Him',
        why: 'Magnifies blessings.',
        count: 100,
      },
    ],
  },
  {
    category: 'For Protection',
    items: [
      {
        arabic: 'بسم الله الذي لا يضر',
        meaning: 'In the name of Allah who does not harm',
        why: 'A prayer for protection.',
        count: 3,
      },
    ],
  },
];

// Theme colors defined outside
const colors = {
  light: {
    background: '#fff',
    text: '#333',
    subText: '#555',
    cardBackgrounds: ['#E0F2FE', '#E0F7FA', '#FFF9C4', '#F3E5F5'],
    headerText: '#333',
    iconColor: '#003366',
    sectionHeaderBorder: '#ddd',
    bottomNavBackground: '#eef5ff',
    bottomNavBorder: '#eee',
    buttonBackground: '#2979FF',
    buttonText: '#fff',
  },
  dark: {
    background: '#121212',
    text: '#fff',
    subText: '#ccc',
    cardBackgrounds: ['#1e1e1e', '#1b1b1b', '#222', '#252525'],
    headerText: '#fff',
    iconColor: '#fff',
    sectionHeaderBorder: '#444',
    bottomNavBackground: '#1e1e1e',
    bottomNavBorder: '#333',
    buttonBackground: '#2979FF',
    buttonText: '#fff',
  },
};

export default function DhikrListScreen({ onStartDhikr, onBack, onForward }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;
  const navigation = useNavigation();

  const [expanded, setExpanded] = useState([]);

  const toggleExpand = (index) => {
    if (expanded.includes(index)) {
      setExpanded(expanded.filter((i) => i !== index));
    } else {
      setExpanded([...expanded, index]);
    }
  };

  const sections = dhikrData.map((section, idx) => ({
    title: section.category,
    data: expanded.includes(idx) ? section.items : [],
    index: idx,
  }));

  const renderSectionHeader = ({ section }) => (
    <TouchableOpacity
      style={styles(theme).sectionHeader}
      onPress={() => toggleExpand(section.index)}
    >
      <Text style={styles(theme).sectionTitle}>{section.title}</Text>
      <Icon
        name={expanded.includes(section.index) ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={theme.subText}
      />
    </TouchableOpacity>
  );

  const renderItem = ({ item, section }) => (
    <View
      style={[
        styles(theme).dhikrCard,
        { backgroundColor: theme.cardBackgrounds[section.index] },
      ]}
    >
      <Text style={styles(theme).arabic}>{item.arabic}</Text>
      <Text style={styles(theme).meaning}>{item.meaning}</Text>
      <Text style={styles(theme).why}>{item.why}</Text>
      <View style={styles(theme).rowBetween}>
        <Text style={styles(theme).count}>x{item.count}</Text>
        <TouchableOpacity
          style={styles(theme).startButton}
          onPress={() => {
            onStartDhikr(item);
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
          <Text style={styles(theme).startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles(theme).container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <View style={styles(theme).headerRow}>
        {/* <TouchableOpacity onPress={onBack} style={styles(theme).backButton}>
          <Icon name="arrow-back" size={26} color={theme.iconColor} />
        </TouchableOpacity> */}
        <View style={styles(theme).titleContainer}>
          <Text style={styles(theme).header}>Dhikr List</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('My List')}
            style={styles(theme).myListButton}
          >
            <Text style={styles(theme).myListText}>My List</Text>
            <Icon name="bookmark-outline" size={20} color={theme.iconColor} style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles(theme).subHeader}>
        Select a dhikr that speaks to your heart and get started.
      </Text>
      <SectionList
        contentContainerStyle={styles(theme).listContent}
        sections={sections}
        keyExtractor={(item, index) => item?.arabic + index}
         renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
      />

    </SafeAreaView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: SCREEN_WIDTH * 0.04,
      backgroundColor: theme.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SCREEN_HEIGHT * 0.06,
      marginBottom: SCREEN_HEIGHT * 0.01,
    },
    backButton: {
      padding: adjust(8),
      marginRight: adjust(8),
    },
    header: {
      fontSize: SCREEN_WIDTH * 0.06,
      fontWeight: 'bold',
      color: theme.headerText,
    },
    subHeader: {
      fontSize: SCREEN_WIDTH * 0.035,
      color: theme.subText,
      marginBottom: SCREEN_HEIGHT * 0.025,
      marginLeft: adjust(8),
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SCREEN_HEIGHT * 0.018,
      paddingHorizontal: adjust(12),
      borderBottomWidth: 1,
      borderColor: theme.sectionHeaderBorder,
      marginTop: adjust(8),
    },
    sectionTitle: {
      fontSize: SCREEN_WIDTH * 0.045,
      fontWeight: '500',
      color: theme.text,
    },
    dhikrCard: {
      borderRadius: adjust(8),
      padding: SCREEN_WIDTH * 0.03,
      marginVertical: SCREEN_HEIGHT * 0.01,
      marginHorizontal: adjust(8),
      elevation: 2,
    },
    arabic: {
      fontSize: SCREEN_WIDTH * 0.055,
      fontWeight: '600',
      color: theme.iconColor,
      textAlign: 'right',
    },
    meaning: {
      fontSize: SCREEN_WIDTH * 0.04,
      color: theme.text,
      marginVertical: SCREEN_HEIGHT * 0.005,
    },
    why: {
      fontSize: SCREEN_WIDTH * 0.032,
      color: theme.subText,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SCREEN_HEIGHT * 0.01,
    },
    count: {
      fontSize: SCREEN_WIDTH * 0.035,
      color: theme.subText,
    },
    startButton: {
      backgroundColor: theme.buttonBackground,
      paddingHorizontal: SCREEN_WIDTH * 0.06,
      paddingVertical: SCREEN_HEIGHT * 0.008,
      borderRadius: adjust(20),
    },
    startButtonText: {
      color: theme.buttonText,
      fontWeight: '500',
      fontSize: SCREEN_WIDTH * 0.04,
    },
    listContent: {
      paddingBottom: SCREEN_HEIGHT * 0.1,
    },
   
    navItem: {
      alignItems: 'center',
    },
    navText: {
      fontSize: adjust(12),
      color: theme.iconColor,
      marginTop: adjust(2),
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingRight: adjust(16),
    },
    myListButton: {
      flexDirection: 'row',
      alignItems: 'center',
      // backgroundColor: theme.buttonBackground,
      paddingHorizontal: adjust(12),
      paddingVertical: adjust(6),
      borderRadius: adjust(20),
    },
    myListText: {
      // color: theme.buttonText,
      color:'#000',
      fontSize: adjust(14),
      fontWeight: '500',
    },
  });