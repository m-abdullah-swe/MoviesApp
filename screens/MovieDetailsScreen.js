import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const MovieDetailsScreen = ({ route, navigation }) => {
  const { movie, darkMode } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    checkIfFavorite();
  }, []);

  const checkIfFavorite = async () => {
    try {
      const favString = await AsyncStorage.getItem("favourites");
      if (!favString) {
        setIsFavorite(false);
        return;
      }
      const favItems = favString.split("||").filter((item) => item);
      const favMovies = favItems.map((item) => JSON.parse(item));
      const isFav = favMovies.some(
        (fav) =>
          fav.title.trim().toLowerCase() === movie.title.trim().toLowerCase() &&
          fav.year === movie.year
      );
      setIsFavorite(isFav);
    } catch (error) {
      console.error("Error checking favorite status", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favString = await AsyncStorage.getItem("favourites");
      let favMovies = [];
      if (favString) {
        favMovies = favString
          .split("||")
          .filter((item) => item)
          .map((item) => JSON.parse(item));
      }
      if (isFavorite) {
        // Remove only the movie with the same title and year (normalized)
        favMovies = favMovies.filter(
          (fav) =>
            !(
              fav.title.trim().toLowerCase() ===
                movie.title.trim().toLowerCase() &&
              fav.year.trim().toLowerCase() === movie.year.trim().toLowerCase()
            )
        );
        Alert.alert("Removed", "Movie removed from favorites.");
      } else {
        favMovies.push(movie);
        Alert.alert("Added", "Movie added to favorites.");
      }
      const newFavString = favMovies.map((m) => JSON.stringify(m)).join("||");
      await AsyncStorage.setItem("favourites", newFavString);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorites", error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        darkMode ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.backButton,
          { backgroundColor: darkMode ? "#000" : "#fff" },
        ]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons
          name="chevron-back"
          size={30}
          color={darkMode ? "#fff" : "#000"}
        />
      </TouchableOpacity>

      <Image source={{ uri: movie.poster }} style={styles.image} />

      <View
        style={[
          styles.overlay,
          darkMode ? styles.darkOverlay : styles.lightOverlay,
        ]}
      >
        <Text style={[styles.title, darkMode && styles.darkText]}>
          {movie.title}
        </Text>
        <Text style={[styles.details, darkMode && styles.darkText]}>
          {`${movie.year} • ${movie.genre}`}
        </Text>
        <Text style={[styles.plot, darkMode && styles.darkText]}>
          {movie.plot}
        </Text>
        <Text style={[styles.rating, darkMode && styles.darkText]}>
          IMDb Rating: {movie.imdbRating}
        </Text>
        <Text style={[styles.director, darkMode && styles.darkText]}>
          Directed by {movie.director}
        </Text>
      </View>

      <TouchableOpacity style={styles.favButton} onPress={toggleFavorite}>
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={24}
          color="#000"
        />
        <Text style={styles.favText}>
          {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: "#f5f5f5",
  },
  darkContainer: {
    backgroundColor: "#1c1c1c",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 5,
    borderRadius: 50,
  },
  image: {
    width: "100%",
    height: 350,
  },
  overlay: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  lightOverlay: {
    backgroundColor: "#f5f5f5",
  },
  darkOverlay: {
    backgroundColor: "#1c1c1c",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  details: {
    fontSize: 16,
    marginVertical: 5,
  },
  plot: {
    fontSize: 14,
    marginVertical: 10,
  },
  rating: {
    fontSize: 14,
    marginVertical: 5,
  },
  director: {
    fontSize: 14,
  },
  darkText: {
    color: "#fff",
  },
  favButton: {
    backgroundColor: "#ffcc00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 30,
    margin: 20,
  },
  favText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#000",
  },
});

export default MovieDetailsScreen;
