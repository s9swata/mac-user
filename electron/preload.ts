import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IpcChannels } from "./ipc-handlers";

export interface TranscriptUpdate {
  type: "transcript";
  speaker: string;
  text: string;
  is_final: boolean;
  confidence: number;
  timestamp: number;
}

export interface StreamStatus {
  status: "connected" | "disconnected" | "error" | "reconnecting" | "force_end";
  message?: string;
  code?: number;
  reason?: string;
}

export interface AppSettings {
  audioStoragePath: string;
  defaultContextLines: number;
}

export interface ElectronAPI {
  login:  (token: string, userId: number, backendUrl?: string) => Promise<{ success: boolean }>;
  loginWithCredentials: (username: string, password: string, backendUrl?: string) => Promise<{
    user: {
      id: number;
      username: string;
      email: string;
      permitted_sessions: number;
      used_sessions: number;
      sessions_remaining: number;
      custom_prompt: string | null;
      is_active: boolean;
    };
  }>;
  logout: () => Promise<{ success: boolean }>;

  minimiseWindow:          () => Promise<{ success: boolean }>;
  toggleMaximiseWindow:    () => Promise<{ success: boolean; isMaximized: boolean }>;
  closeWindow:             () => Promise<{ success: boolean }>;
  dragWindowBy:            (dx: number, dy: number) => Promise<void>;
  setAlwaysOnTop:          (value: boolean) => void;
  setContentProtection:    (value: boolean) => void;

  getAppVersion:  () => Promise<string>;
  getSystemInfo:  () => Promise<Record<string, string>>;
  showError:      (title: string, message: string) => Promise<void>;

  sessionStart: () => Promise<{ allowed: boolean; active_slot?: number | null; reason?: string }>;
  sessionRespond: (payload: { utterance: string; history: string[] }) => Promise<{ should_respond: boolean; answer?: string; reason?: string }>;
  sessionTranscribe: (payload: { audio_base64: string; audio_mime_type?: string }) => Promise<{ transcript: string[] }>;
  sessionEnd: (payload: { transcript: string[]; audio_base64?: string; audio_mime_type?: string; session_id?: string }) => Promise<{ summary: string }>;

  streamConnect: () => Promise<{ success: boolean; sessionId?: string; error?: string }>;
  streamDisconnect: () => Promise<{ success: boolean; sessionId?: string }>;
  streamSendAudio: (audioChunk: ArrayBuffer) => Promise<{ success: boolean; error?: string }>;
  onStreamTranscript: (callback: (data: TranscriptUpdate) => void) => () => void;
  onStreamStatus: (callback: (data: StreamStatus) => void) => () => void;

  sessionHelp: (payload?: { sessionId?: string; contextLines?: number }) => Promise<{
    success: boolean;
    context?: string;
    answer?: string;
    reason?: string;
  }>;

  // Global hotkey
  hotkeyRegister: () => Promise<{ success: boolean }>;
  hotkeyUnregister: () => Promise<{ success: boolean }>;
  onHotkeyTriggered: (callback: () => void) => () => void;

  getSettings: () => Promise<AppSettings>;
  setSettings: (settings: Partial<AppSettings>) => Promise<{ success: boolean; settings: AppSettings }>;
  getAudioStoragePath: () => Promise<string>;
  setAudioStoragePath: (path: string) => Promise<{ success: boolean; path: string }>;
  browseFolder: () => Promise<{ success: boolean; canceled?: boolean; path?: string }>;

  startAudioRecording: () => Promise<{ success: boolean; path?: string; error?: string }>;
  stopAudioRecording: () => Promise<{ success: boolean; path?: string; error?: string }>;
  writeAudioChunk: (chunk: ArrayBuffer) => void;
  getRecordingPath: () => Promise<{ path: string | null; isRecording: boolean }>;

  getUserProfile: () => Promise<{
    id: number;
    username: string;
    email: string;
    permitted_sessions: number;
    used_sessions: number;
    sessions_remaining: number;
    custom_prompt: string | null;
    is_active: boolean;
  }>;
}

contextBridge.exposeInMainWorld("electronAPI", {
  login: (token: string, userId: number, backendUrl?: string) =>
    ipcRenderer.invoke(IpcChannels.LOGIN, { token, userId, backendUrl }),

  loginWithCredentials: (username: string, password: string, backendUrl?: string) =>
    ipcRenderer.invoke(IpcChannels.LOGIN_WITH_CREDENTIALS, { username, password, backendUrl }),

  logout: () =>
    ipcRenderer.invoke(IpcChannels.LOGOUT),

  minimiseWindow: () =>
    ipcRenderer.invoke(IpcChannels.WINDOW_MINIMISE),

  toggleMaximiseWindow: () =>
    ipcRenderer.invoke(IpcChannels.WINDOW_TOGGLE_MAXIMISE),

  closeWindow: () =>
    ipcRenderer.invoke(IpcChannels.WINDOW_CLOSE),

  dragWindowBy: (dx: number, dy: number) =>
    ipcRenderer.invoke(IpcChannels.WINDOW_DRAG_BY, { dx, dy }),

  setAlwaysOnTop: (value: boolean) =>
    ipcRenderer.send(IpcChannels.WINDOW_TOGGLE_ALWAYS_ON_TOP, value),

  setContentProtection: (value: boolean) =>
    ipcRenderer.send(IpcChannels.WINDOW_TOGGLE_CONTENT_PROTECTION, value),

  getAppVersion: () =>
    ipcRenderer.invoke(IpcChannels.GET_APP_VERSION),

  getSystemInfo: () =>
    ipcRenderer.invoke(IpcChannels.GET_SYSTEM_INFO),

  showError: (title: string, message: string) =>
    ipcRenderer.invoke(IpcChannels.SHOW_ERROR_DIALOG, { title, message }),

  sessionStart: () =>
    ipcRenderer.invoke(IpcChannels.SESSION_START),

  sessionRespond: (payload: { utterance: string; history: string[] }) =>
    ipcRenderer.invoke(IpcChannels.SESSION_RESPOND, payload),

  sessionTranscribe: (payload: { audio_base64: string; audio_mime_type?: string }) =>
    ipcRenderer.invoke(IpcChannels.SESSION_TRANSCRIBE, payload),

  sessionEnd: (payload: { transcript: string[]; audio_base64?: string; audio_mime_type?: string; session_id?: string }) =>
    ipcRenderer.invoke(IpcChannels.SESSION_END, payload),

  streamConnect: () =>
    ipcRenderer.invoke(IpcChannels.STREAM_CONNECT),

  streamDisconnect: () =>
    ipcRenderer.invoke(IpcChannels.STREAM_DISCONNECT),

  streamSendAudio: (audioChunk: ArrayBuffer) =>
    ipcRenderer.invoke(IpcChannels.STREAM_SEND_AUDIO, audioChunk),

  onStreamTranscript: (callback: (data: TranscriptUpdate) => void) => {
    const handler = (_event: IpcRendererEvent, data: TranscriptUpdate) => callback(data);
    ipcRenderer.on(IpcChannels.STREAM_TRANSCRIPT, handler);
    return () => ipcRenderer.removeListener(IpcChannels.STREAM_TRANSCRIPT, handler);
  },

  onStreamStatus: (callback: (data: StreamStatus) => void) => {
    const handler = (_event: IpcRendererEvent, data: StreamStatus) => callback(data);
    ipcRenderer.on(IpcChannels.STREAM_STATUS, handler);
    return () => ipcRenderer.removeListener(IpcChannels.STREAM_STATUS, handler);
  },

  sessionHelp: (payload?: { sessionId?: string; contextLines?: number }) =>
    ipcRenderer.invoke(IpcChannels.SESSION_HELP, payload || {}),

  // Global hotkey
  hotkeyRegister: () =>
    ipcRenderer.invoke(IpcChannels.HOTKEY_REGISTER),

  hotkeyUnregister: () =>
    ipcRenderer.invoke(IpcChannels.HOTKEY_UNREGISTER),

  onHotkeyTriggered: (callback: () => void) => {
    const handler = (_event: IpcRendererEvent) => callback();
    ipcRenderer.on(IpcChannels.HOTKEY_TRIGGERED, handler);
    return () => ipcRenderer.removeListener(IpcChannels.HOTKEY_TRIGGERED, handler);
  },

  getSettings: () =>
    ipcRenderer.invoke(IpcChannels.SETTINGS_GET),

  setSettings: (settings: Partial<AppSettings>) =>
    ipcRenderer.invoke(IpcChannels.SETTINGS_SET, settings),

  getAudioStoragePath: () =>
    ipcRenderer.invoke(IpcChannels.SETTINGS_GET_AUDIO_PATH),

  setAudioStoragePath: (path: string) =>
    ipcRenderer.invoke(IpcChannels.SETTINGS_SET_AUDIO_PATH, path),

  browseFolder: () =>
    ipcRenderer.invoke(IpcChannels.SETTINGS_BROWSE_FOLDER),

  startAudioRecording: () =>
    ipcRenderer.invoke(IpcChannels.AUDIO_START_RECORDING),

  stopAudioRecording: () =>
    ipcRenderer.invoke(IpcChannels.AUDIO_STOP_RECORDING),

  writeAudioChunk: (chunk: ArrayBuffer) =>
    ipcRenderer.send("audio:write-chunk", chunk),

  getRecordingPath: () =>
    ipcRenderer.invoke(IpcChannels.AUDIO_GET_RECORDING_PATH),

  getUserProfile: () =>
    ipcRenderer.invoke(IpcChannels.USER_GET_PROFILE),
} satisfies ElectronAPI);