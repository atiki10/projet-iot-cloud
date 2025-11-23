// WebSocket support removed / deprecated
// The application now uses AJAX polling (fetch) to update tracking data.
// This file remains as a compatibility stub. If any remaining code imports
// `connectWebSocket`, it will get a function that throws with a clear message.

export function connectWebSocket(): never {
  throw new Error('WebSocket has been removed. Use polling via fetchTrackingData() instead.');
}

export default connectWebSocket;
