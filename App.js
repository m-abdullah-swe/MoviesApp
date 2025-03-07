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
          options={{headerShown: false }}
        />
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={{headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
