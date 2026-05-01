import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface VPNServer {
  id: string;
  name: string;
  country: string;
  city: string;
  flag: string;
  load: number;
  ping: number;
}

const SERVERS: VPNServer[] = [
  { id: '1', name: 'US East', country: 'United States', city: 'New York', flag: '\u{1F1FA}\u{1F1F8}', load: 23, ping: 15 },
  { id: '2', name: 'UK London', country: 'United Kingdom', city: 'London', flag: '\u{1F1EC}\u{1F1E7}', load: 45, ping: 89 },
  { id: '3', name: 'DE Frankfurt', country: 'Germany', city: 'Frankfurt', flag: '\u{1F1E9}\u{1F1EA}', load: 18, ping: 95 },
  { id: '4', name: 'JP Tokyo', country: 'Japan', city: 'Tokyo', flag: '\u{1F1EF}\u{1F1F5}', load: 52, ping: 142 },
  { id: '5', name: 'SG Singapore', country: 'Singapore', city: 'Singapore', flag: '\u{1F1F8}\u{1F1EC}', load: 31, ping: 168 },
  { id: '6', name: 'CA Toronto', country: 'Canada', city: 'Toronto', flag: '\u{1F1E8}\u{1F1E6}', load: 15, ping: 22 },
];

type Tab = 'home' | 'servers' | 'account';

export default function App() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]!);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleToggle = () => {
    if (connected) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setConnected(false);
      setDuration(0);
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }, 2000);
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderHome = () => (
    <View style={styles.homeContainer}>
      <View style={[styles.statusBadge, connected && styles.statusBadgeConnected]}>
        <View style={[styles.statusDot, connected && styles.statusDotConnected]} />
        <Text style={[styles.statusText, connected && styles.statusTextConnected]}>
          {connecting ? 'Connecting...' : connected ? 'Protected' : 'Not Protected'}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleToggle}
        disabled={connecting}
        style={[styles.powerButton, connected && styles.powerButtonConnected]}
        activeOpacity={0.7}
      >
        <Text style={[styles.powerIcon, connected && styles.powerIconConnected]}>
          {'\u23FB'}
        </Text>
      </TouchableOpacity>

      {connected && (
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{formatDuration(duration)}</Text>
          <Text style={styles.statText}>{selectedServer.ping}ms</Text>
        </View>
      )}

      <TouchableOpacity style={styles.serverSelector} activeOpacity={0.7}>
        <Text style={styles.serverFlag}>{selectedServer.flag}</Text>
        <View>
          <Text style={styles.serverName}>{selectedServer.name}</Text>
          <Text style={styles.serverLocation}>{selectedServer.city}, {selectedServer.country}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.quickSettings}>
        <Text style={styles.sectionTitle}>Quick Settings</Text>
        <SettingRow label="Kill Switch" description="Block internet if VPN drops" defaultOn />
        <SettingRow label="Auto Connect" description="Connect on startup" defaultOn />
        <SettingRow label="Split Tunneling" description="Choose which apps use VPN" />
      </View>
    </View>
  );

  const renderServers = () => (
    <View style={styles.serversContainer}>
      <Text style={styles.pageTitle}>Servers</Text>
      <Text style={styles.pageSubtitle}>Choose a VPN server</Text>
      {SERVERS.map((server) => (
        <TouchableOpacity
          key={server.id}
          style={[styles.serverCard, selectedServer.id === server.id && styles.serverCardSelected]}
          onPress={() => setSelectedServer(server)}
          activeOpacity={0.7}
        >
          <View style={styles.serverCardLeft}>
            <Text style={styles.serverCardFlag}>{server.flag}</Text>
            <View>
              <Text style={styles.serverCardName}>{server.name}</Text>
              <Text style={styles.serverCardCity}>{server.city}</Text>
            </View>
          </View>
          <View style={styles.serverCardRight}>
            <Text style={styles.serverCardPing}>{server.ping}ms</Text>
            <Text style={[
              styles.serverCardLoad,
              server.load < 40 ? styles.loadGreen : server.load < 70 ? styles.loadYellow : styles.loadRed,
            ]}>
              {server.load}%
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAccount = () => (
    <View style={styles.accountContainer}>
      <Text style={styles.pageTitle}>Account</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <Text style={styles.profileName}>ShieldVPN User</Text>
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>Free Plan</Text>
        </View>
      </View>

      <View style={styles.menuCard}>
        <MenuItem label="Manage Devices" />
        <MenuItem label="Subscription" />
        <MenuItem label="Help & Support" />
        <MenuItem label="Privacy Policy" />
        <MenuItem label="Sign Out" danger />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#030712" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'servers' && renderServers()}
        {activeTab === 'account' && renderAccount()}
      </ScrollView>

      <View style={styles.tabBar}>
        <TabButton label="Home" active={activeTab === 'home'} onPress={() => setActiveTab('home')} icon={'\u{1F3E0}'} />
        <TabButton label="Servers" active={activeTab === 'servers'} onPress={() => setActiveTab('servers')} icon={'\u{1F310}'} />
        <TabButton label="Account" active={activeTab === 'account'} onPress={() => setActiveTab('account')} icon={'\u{1F464}'} />
      </View>
    </View>
  );
}

function TabButton({ label, active, onPress, icon }: { label: string; active: boolean; onPress: () => void; icon: string }) {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SettingRow({ label, description, defaultOn }: { label: string; description: string; defaultOn?: boolean }) {
  const [enabled, setEnabled] = useState(defaultOn || false);
  return (
    <TouchableOpacity style={styles.settingRow} onPress={() => setEnabled(!enabled)} activeOpacity={0.7}>
      <View>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <View style={[styles.toggle, enabled && styles.toggleEnabled]}>
        <View style={[styles.toggleKnob, enabled && styles.toggleKnobEnabled]} />
      </View>
    </TouchableOpacity>
  );
}

function MenuItem({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
      <Text style={[styles.menuItemText, danger && styles.menuItemDanger]}>{label}</Text>
      <Text style={styles.menuItemArrow}>{'\u203A'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },

  // Home
  homeContainer: { alignItems: 'center', paddingBottom: 40 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151',
  },
  statusBadgeConnected: { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: '#166534' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6b7280' },
  statusDotConnected: { backgroundColor: '#22c55e' },
  statusText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
  statusTextConnected: { color: '#4ade80' },

  powerButton: {
    width: 140, height: 140, borderRadius: 70, marginTop: 40, marginBottom: 20,
    backgroundColor: 'rgba(31,41,55,0.5)', borderWidth: 3, borderColor: '#374151',
    alignItems: 'center', justifyContent: 'center',
  },
  powerButtonConnected: {
    backgroundColor: 'rgba(34,197,94,0.1)', borderColor: '#22c55e',
  },
  powerIcon: { fontSize: 48, color: '#6b7280' },
  powerIconConnected: { color: '#4ade80' },

  statsRow: {
    flexDirection: 'row', gap: 24, marginBottom: 24,
  },
  statText: { fontSize: 14, color: '#9ca3af', fontFamily: 'monospace' },

  serverSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    width: '100%', padding: 16, borderRadius: 12,
    backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937',
  },
  serverFlag: { fontSize: 24 },
  serverName: { fontSize: 16, fontWeight: '600', color: '#f3f4f6' },
  serverLocation: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  quickSettings: {
    width: '100%', marginTop: 24, padding: 16, borderRadius: 12,
    backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937',
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#d1d5db', marginBottom: 12 },

  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937',
  },
  settingLabel: { fontSize: 14, fontWeight: '500', color: '#e5e7eb' },
  settingDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  toggle: {
    width: 44, height: 24, borderRadius: 12, backgroundColor: '#374151',
    justifyContent: 'center', padding: 2,
  },
  toggleEnabled: { backgroundColor: '#1d6ef1' },
  toggleKnob: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
  },
  toggleKnobEnabled: { alignSelf: 'flex-end' },

  // Servers
  serversContainer: { paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#f9fafb' },
  pageSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  serverCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 12, marginBottom: 8,
    backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937',
  },
  serverCardSelected: { borderColor: '#1d6ef1', backgroundColor: 'rgba(29,110,241,0.08)' },
  serverCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  serverCardFlag: { fontSize: 20 },
  serverCardName: { fontSize: 14, fontWeight: '600', color: '#e5e7eb' },
  serverCardCity: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  serverCardRight: { alignItems: 'flex-end', gap: 4 },
  serverCardPing: { fontSize: 12, color: '#6b7280' },
  serverCardLoad: { fontSize: 12, fontWeight: '600' },
  loadGreen: { color: '#4ade80' },
  loadYellow: { color: '#facc15' },
  loadRed: { color: '#f87171' },

  // Account
  accountContainer: { paddingBottom: 40 },
  profileCard: {
    alignItems: 'center', padding: 24, borderRadius: 12, marginTop: 20,
    backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937',
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#1d6ef1',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  profileName: { fontSize: 18, fontWeight: '600', color: '#f3f4f6' },
  planBadge: {
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    backgroundColor: 'rgba(29,110,241,0.15)', borderWidth: 1, borderColor: '#1d4ed8',
  },
  planBadgeText: { fontSize: 12, fontWeight: '600', color: '#60a5fa' },

  menuCard: {
    marginTop: 20, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1f2937',
  },
  menuItemText: { fontSize: 14, color: '#e5e7eb' },
  menuItemDanger: { color: '#f87171' },
  menuItemArrow: { fontSize: 20, color: '#6b7280' },

  // Tab bar
  tabBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 8, paddingBottom: 28,
    backgroundColor: '#0a0f1a', borderTopWidth: 1, borderTopColor: '#1f2937',
  },
  tabButton: { alignItems: 'center', gap: 4, paddingVertical: 4, minWidth: width / 3 - 20 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: '#6b7280' },
  tabLabelActive: { color: '#338dfc', fontWeight: '600' },
});
