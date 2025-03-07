import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const Tab = createMaterialTopTabNavigator();

const MovieSearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");

  const cache = new Map();

  const fetchMovies = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    if (cache.has(query)) {
      setMovies(cache.get(query));
      setLoading(false);
      return;
    }

    try {
      const apiUrl = `http://192.168.100.46:3000/search?query=${query}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        cache.set(query, data);
        setMovies(data);
      } else {
        setMovies([]);
      }
    } catch (err) {
      setError("Failed to fetch movies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const MovieList = ({ data }) => (
    <FlatList
      data={data}
      keyExtractor={(item, index) => index.toString()}
      style={{
        backgroundColor: darkMode ? "#1c1c1c" : "#f5f5f5",
        marginHorizontal: 15,
        paddingHorizontal: 5,
      }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => handleNavigation(item)}
          style={[styles.movieCard, darkMode && styles.darkCard]}
        >
          <Image source={{ uri: item.poster }} style={styles.image} />
          <View style={styles.cardContent}>
            <Text
              style={[styles.title, darkMode && { color: "#fff" }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.subtitle}>{item.year}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {item.genre}
            </Text>
            <Text style={styles.plot} numberOfLines={4}>
              {item.plot}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );

  const BestMatchesScreen = () => (
    <View style={darkMode ? styles.bestDarkContainer : styles.bestContainer}>
      {loading && <ActivityIndicator size="large" style={styles.loader} color={"#ffcc00"}/>}
      {!loading && movies.length === 0 && (
        <Text style={{ textAlign: "center" }}>No results found.</Text>
      )}
      {!loading && <MovieList data={movies} />}
    </View>
  );

  const FavouritesScreen = () => {
    const [favourites, setFavourites] = useState([]);

    const fetchFavourites = async () => {
      try {
        const favString = await AsyncStorage.getItem("favourites");
        if (!favString) {
          setFavourites([]);
          return;
        }
        const favItems = favString.split("||").filter((item) => item);
        const favMovies = favItems.map((item) => JSON.parse(item));
        setFavourites(favMovies);
      } catch (error) {
        console.error("Error fetching favourites", error);
      }
    };

    useFocusEffect(
      useCallback(() => {
        fetchFavourites();
      }, [])
    );

    return (<View style={darkMode ? styles.bestDarkContainer : styles.bestContainer}>
      <MovieList data={favourites} />
    </View>);
  };

  const handleNavigation = (item) => {
    navigation.navigate("MovieDetails", {
      movie: item,
      darkMode,
    });
  };

  return (
    <View style={darkMode ? styles.darkContainer : styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>
          Movie Search
        </Text>
        <TouchableOpacity onPress={() => setDarkMode(!darkMode)}>
          <Ionicons
            name={darkMode ? "moon" : "sunny"}
            size={24}
            color={darkMode ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBox, darkMode && styles.darkSearchBox]}>
        <TextInput
          placeholder="Search for a movie..."
          value={query}
          onChangeText={setQuery}
          style={[styles.input, darkMode && styles.darkInput]}
          placeholderTextColor={darkMode ? "#bbb" : "#666"}
        />
        <TouchableOpacity style={styles.searchButton} onPress={fetchMovies}>
          <Ionicons
            name="search"
            size={25}
            color={darkMode ? "#1c1c1c" : "#f3f3f3"}
          />
        </TouchableOpacity>
      </View>
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
          tabBarStyle: { backgroundColor: darkMode ? "#333" : "#fff" },
          tabBarIndicatorStyle: { backgroundColor: "#ffcc00", height: 3 },
        }}
      >
        <Tab.Screen name="Best Matches" component={BestMatchesScreen} />
        <Tab.Screen name="Favourites" component={FavouritesScreen} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: "#f5f5f5",
  },
  darkContainer: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: "#1c1c1c",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  darkText: {
    color: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  darkSearchBox: {
    backgroundColor: "#333",
    borderColor: "#555",
  },
  input: {
    padding: 12,
    flex: 1,
    borderRadius: 10,
  },
  darkInput: {
    backgroundColor: "#333",
    color: "#fff",
    borderColor: "#555",
  },
  searchButton: {
    backgroundColor: "#ffcc00",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    borderRadius: 5,
    margin: 5,
  },
  loader: {
    marginVertical: 20,
  },
  movieCard: {
    flexDirection: "row",
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
  },
  darkCard: {
    backgroundColor: "#333",
    borderColor: "#ddd",
    borderWidth: 1,
  },
  image: {
    width: 100,
    height: 150,
  },
  cardContent: {
    padding: 10,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  plot: {
    fontSize: 12,
    color: "#666",
  },
  bestContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 10,
  },
  bestDarkContainer: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#1c1c1c",
  },
});

export default MovieSearchScreen;
