import { supabase, hasSupabase } from './supabase';
import { CATEGORIES, CEREMONY_START } from '../data/categories';

const STORAGE_KEY = 'oscars-ballot-2026';

export function saveCurrentParticipant(roomCode, participant) {
  try {
    localStorage.setItem(
      `${STORAGE_KEY}-current-${roomCode}`,
      JSON.stringify(participant)
    );
  } catch {}
}

export function getCurrentParticipant(roomCode) {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}-current-${roomCode}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveLastRoomCode(roomCode) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-last-room`, roomCode);
  } catch {}
}

export function getLastRoomCode() {
  try {
    return localStorage.getItem(`${STORAGE_KEY}-last-room`);
  } catch {
    return null;
  }
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function getLocalRooms() {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}-rooms`);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setLocalRooms(rooms) {
  localStorage.setItem(`${STORAGE_KEY}-rooms`, JSON.stringify(rooms));
}

function getLocalResults() {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}-results`);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setLocalResults(results) {
  localStorage.setItem(`${STORAGE_KEY}-results`, JSON.stringify(results));
}

// Local-only API for when Supabase is not configured (demo/dev mode)
export const localApi = {
  async createRoom(name = '') {
    const code = generateId();
    const room = {
      id: code,
      code,
      name: name || `Ballot ${code.slice(0, 6)}`,
      createdAt: new Date().toISOString(),
      lockedAt: null,
    };
    const rooms = getLocalRooms();
    rooms[code] = room;
    setLocalRooms(rooms);
    return room;
  },

  async getRoom(code) {
    const rooms = getLocalRooms();
    return rooms[code] || null;
  },

  async joinRoom(code, displayName) {
    const room = await this.getRoom(code);
    if (!room) return { room: null, participant: null };
    const participantId = generateId();
    const participant = {
      id: participantId,
      roomId: code,
      displayName,
      ballot: {},
      joinedAt: new Date().toISOString(),
    };
    const key = `${STORAGE_KEY}-participants-${code}`;
    const participants = JSON.parse(localStorage.getItem(key) || '{}');
    participants[participantId] = participant;
    localStorage.setItem(key, JSON.stringify(participants));
    return { room, participant };
  },

  async submitBallot(roomCode, participantId, ballot) {
    const key = `${STORAGE_KEY}-participants-${roomCode}`;
    const participants = JSON.parse(localStorage.getItem(key) || '{}');
    const p = participants[participantId];
    if (!p) return null;
    p.ballot = ballot;
    participants[participantId] = p;
    localStorage.setItem(key, JSON.stringify(participants));
    return p;
  },

  async getParticipants(roomCode) {
    const key = `${STORAGE_KEY}-participants-${roomCode}`;
    const participants = JSON.parse(localStorage.getItem(key) || '{}');
    return Object.values(participants);
  },

  async removeParticipant(roomCode, participantId) {
    const key = `${STORAGE_KEY}-participants-${roomCode}`;
    const participants = JSON.parse(localStorage.getItem(key) || '{}');
    delete participants[participantId];
    localStorage.setItem(key, JSON.stringify(participants));
    const currentKey = `${STORAGE_KEY}-current-${roomCode}`;
    try {
      const current = JSON.parse(localStorage.getItem(currentKey) || 'null');
      if (current?.id === participantId) {
        localStorage.removeItem(currentKey);
      }
    } catch {}
  },

  async setResult(categoryId, winnerId) {
    const results = getLocalResults();
    results[categoryId] = {
      winnerId: winnerId ?? null,
      announcedAt: new Date().toISOString(),
    };
    setLocalResults(results);
    return results;
  },

  getResults() {
    return getLocalResults();
  },

  async clearAllResults() {
    setLocalResults({});
  },

  isLocked() {
    return new Date() >= new Date(CEREMONY_START);
  },
};

// Supabase API
export const supabaseApi = {
  async createRoom(name = '') {
    const code = generateId();
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code,
        name: name || `Ballot ${code.slice(0, 6)}`,
        locked_at: null,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      createdAt: data.created_at,
      lockedAt: data.locked_at,
    };
  },

  async getRoom(code) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      createdAt: data.created_at,
      lockedAt: data.locked_at,
    };
  },

  async joinRoom(code, displayName) {
    const room = await this.getRoom(code);
    if (!room) return { room: null, participant: null };
    const { data: participant, error } = await supabase
      .from('participants')
      .insert({
        room_id: room.id,
        display_name: displayName,
        ballot: {},
      })
      .select()
      .single();
    if (error) throw error;
    return {
      room,
      participant: {
        id: participant.id,
        roomId: room.id,
        displayName: participant.display_name,
        ballot: participant.ballot || {},
        joinedAt: participant.joined_at,
      },
    };
  },

  async submitBallot(roomCode, participantId, ballot) {
    const room = await this.getRoom(roomCode);
    if (!room) return null;
    const { data, error } = await supabase
      .from('participants')
      .update({ ballot })
      .eq('id', participantId)
      .eq('room_id', room.id)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      displayName: data.display_name,
      ballot: data.ballot,
      joinedAt: data.joined_at,
    };
  },

  async getParticipants(roomCode) {
    const room = await this.getRoom(roomCode);
    if (!room) return [];
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', room.id);
    if (error) return [];
    return data.map((p) => ({
      id: p.id,
      displayName: p.display_name,
      ballot: p.ballot || {},
      joinedAt: p.joined_at,
    }));
  },

  async removeParticipant(roomCode, participantId) {
    const room = await this.getRoom(roomCode);
    if (!room) return;
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId)
      .eq('room_id', room.id);
    if (error) throw error;
  },

  async subscribeParticipants(roomCode, callback) {
    const room = await this.getRoom(roomCode);
    if (!room) return null;
    return supabase
      .channel(`room:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `room_id=eq.${room.id}`,
        },
        () => callback()
      )
      .subscribe();
  },

  async setResult(categoryId, winnerId) {
    const { error } = await supabase.from('results').upsert(
      {
        category_id: categoryId,
        winner_id: winnerId ?? null,
        announced_at: new Date().toISOString(),
      },
      { onConflict: 'category_id' }
    );
    if (error) throw error;
  },

  async getResults() {
    const { data } = await supabase.from('results').select('*');
    const map = {};
    (data || []).forEach((r) => {
      map[r.category_id] = { winnerId: r.winner_id, announcedAt: r.announced_at };
    });
    return map;
  },

  async clearAllResults() {
    const { error } = await supabase
      .from('results')
      .delete()
      .in('category_id', CATEGORIES.map((c) => c.id));
    if (error) throw error;
  },

  subscribeResults(callback) {
    return supabase
      .channel('results')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, () =>
        callback()
      )
      .subscribe();
  },

  isLocked() {
    return new Date() >= new Date(CEREMONY_START);
  },
};

export const api = hasSupabase() ? supabaseApi : localApi;

export { CATEGORIES, CEREMONY_START };
