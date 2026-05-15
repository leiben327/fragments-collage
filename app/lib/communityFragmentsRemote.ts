/**
 * Remote sync is not wired in the public MVP prototype (local IndexedDB only).
 * When you add a backend later, implement upload + list here and call from the share flow.
 */

import type { CommunityFragmentRow } from "./communityFragmentsIndexedDb";

export type RemoteSyncConfig = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export async function pushCommunityFragmentRemote(
  _row: CommunityFragmentRow,
  _imageBlob: Blob,
  _config?: RemoteSyncConfig,
): Promise<{ ok: boolean; error?: string }> {
  void _row;
  void _imageBlob;
  void _config;
  return { ok: false, error: "Remote sync not enabled in this build." };
}
