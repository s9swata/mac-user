export const IpcChannels = {
  LOGIN:   "auth:login",
  LOGIN_WITH_CREDENTIALS: "auth:login-with-credentials",
  LOGOUT:  "auth:logout",

  WINDOW_MINIMISE:                  "window:minimise",
  WINDOW_TOGGLE_MAXIMISE:           "window:toggle-maximise",
  WINDOW_CLOSE:                     "window:close",
  WINDOW_DRAG_BY:                   "window:drag-by",
  WINDOW_TOGGLE_ALWAYS_ON_TOP:      "window:alwaysOnTop",
  WINDOW_TOGGLE_CONTENT_PROTECTION: "window:contentProtection",

  GET_APP_VERSION:    "util:app-version",
  GET_SYSTEM_INFO:    "util:system-info",
  SHOW_ERROR_DIALOG:  "util:error-dialog",

  SESSION_START:      "session:start",
  SESSION_RESPOND:    "session:respond",
  SESSION_TRANSCRIBE: "session:transcribe",
  SESSION_END:        "session:end",

  STREAM_CONNECT:     "stream:connect",
  STREAM_DISCONNECT:  "stream:disconnect",
  STREAM_SEND_AUDIO:  "stream:send-audio",
  STREAM_TRANSCRIPT:  "stream:transcript",
  STREAM_STATUS:      "stream:status",

  SESSION_HELP:       "session:help",

  SETTINGS_GET:             "settings:get",
  SETTINGS_SET:             "settings:set",
  SETTINGS_GET_AUDIO_PATH:  "settings:get-audio-path",
  SETTINGS_SET_AUDIO_PATH:  "settings:set-audio-path",
  SETTINGS_BROWSE_FOLDER:   "settings:browse-folder",

  AUDIO_START_RECORDING:    "audio:start-recording",
  AUDIO_STOP_RECORDING:     "audio:stop-recording",
  AUDIO_GET_RECORDING_PATH: "audio:get-recording-path",

  USER_GET_PROFILE:   "user:get-profile",

  // ── Global hotkey (works even when app has no focus) ──────────────────
  HOTKEY_REGISTER:    "hotkey:register",
  HOTKEY_UNREGISTER:  "hotkey:unregister",
  HOTKEY_TRIGGERED:   "hotkey:triggered",
} as const;

export type IpcChannel = typeof IpcChannels[keyof typeof IpcChannels];