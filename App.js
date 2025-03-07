import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MovieSearchScreen from "./screens/MovieSearchScreen";
import MovieDetailsScreen from "./screens/MovieDetailsScreen";

const Stack = createStackNavigator();


const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MovieSearch">
        <Stack.Screen
          name="MovieSearch"
          component={MovieSearchScreen}
          options={{ title: "Movie Search", headerShown: false }}
        />
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={{ title: "Movie Details", headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
