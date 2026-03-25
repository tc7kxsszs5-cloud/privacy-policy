import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0a0a0a', borderTopColor: 'rgba(201,168,76,0.1)' },
      tabBarActiveTintColor: '#C9A84C',
      tabBarInactiveTintColor: '#555',
    }}>
      <Tabs.Screen name="index" options={{ title: 'Главная' }} />
      <Tabs.Screen name="profile" options={{ title: 'Профиль' }} />
    </Tabs>
  )
}
