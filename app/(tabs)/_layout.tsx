import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0f0f0f', borderTopColor: '#1a1a1a' },
      tabBarActiveTintColor: '#e63946',
      tabBarInactiveTintColor: '#555',
    }}>
      <Tabs.Screen name="index" options={{ title: 'Главная' }} />
      <Tabs.Screen name="profile" options={{ title: 'Профиль' }} />
    </Tabs>
  )
}
