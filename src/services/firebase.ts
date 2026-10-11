/**
 * Mahi Crick Pro - Firebase Online Cloud Sync Service
 * Real-time cloud synchronization for live matches and spectator sharing
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Match, Team, Player } from '../types/cricket';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: null,
      email: null,
    },
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

// Test initial connection as required by skill guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'matches', 'connection-test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline or network is disconnected.');
    }
    return false;
  }
}

// Non-blocking initial connectivity check
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection().catch(() => {});
  }, 100);
}

export interface EnrichedMatchPayload extends Match {
  teamAName?: string;
  teamBName?: string;
  teamAShortName?: string;
  teamBShortName?: string;
  teamAColor?: string;
  teamBColor?: string;
  playerNamesMap?: Record<string, string>;
  cloudSyncedAt?: number;
}

class CloudSyncService {
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Upload or sync match state to Firestore cloud with rich team/player metadata
   */
  async syncMatchToCloud(
    match: Match,
    teams?: Team[],
    players?: Player[]
  ): Promise<boolean> {
    const docPath = `matches/${match.id}`;
    try {
      const matchRef = doc(db, 'matches', match.id);

      // Clean undefined values before writing to Firestore
      const cleanMatch: EnrichedMatchPayload = JSON.parse(JSON.stringify(match));
      cleanMatch.cloudSyncedAt = Date.now();

      // Enrich with team names and player maps for instant spectator viewing without local storage
      if (teams && teams.length > 0) {
        const teamA = teams.find((t) => t.id === match.teamAId);
        const teamB = teams.find((t) => t.id === match.teamBId);
        if (teamA) {
          cleanMatch.teamAName = teamA.name;
          cleanMatch.teamAShortName = teamA.shortName;
          cleanMatch.teamAColor = teamA.primaryColor;
        }
        if (teamB) {
          cleanMatch.teamBName = teamB.name;
          cleanMatch.teamBShortName = teamB.shortName;
          cleanMatch.teamBColor = teamB.primaryColor;
        }
      }

      if (players && players.length > 0) {
        const pMap: Record<string, string> = {};
        players.forEach((p) => {
          pMap[p.id] = p.fullName;
        });
        cleanMatch.playerNamesMap = pMap;
      }

      await setDoc(matchRef, cleanMatch, { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
      return false;
    }
  }

  /**
   * Subscribe to live match updates from Firestore (for spectators)
   */
  subscribeToCloudMatch(
    matchId: string,
    onUpdate: (match: EnrichedMatchPayload) => void,
    onError?: (err: any) => void
  ): () => void {
    const docPath = `matches/${matchId}`;
    try {
      const matchRef = doc(db, 'matches', matchId);
      const unsubscribe = onSnapshot(
        matchRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as EnrichedMatchPayload;
            onUpdate(data);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, docPath);
          if (onError) onError(error);
        }
      );
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
      return () => {};
    }
  }

  /**
   * Fetch a single match document from cloud
   */
  async fetchCloudMatch(matchId: string): Promise<EnrichedMatchPayload | null> {
    const docPath = `matches/${matchId}`;
    try {
      const matchRef = doc(db, 'matches', matchId);
      const snapshot = await getDoc(matchRef);
      if (snapshot.exists()) {
        return snapshot.data() as EnrichedMatchPayload;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
      return null;
    }
  }
}

export const cloudSyncService = new CloudSyncService();
