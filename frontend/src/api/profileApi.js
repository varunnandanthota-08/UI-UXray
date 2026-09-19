/**
 * Facilitator Profile & Settings API Service
 */
import { facilitatorApi } from './facilitatorApi';

export const profileApi = {
  getProfile: () => facilitatorApi.getProfile(),
  updateProfile: (profileData) => facilitatorApi.updateProfile(profileData),
  getSettings: () => facilitatorApi.getSettings(),
  saveSettings: (settingsData) => facilitatorApi.saveSettings(settingsData),
  resetSettings: () => facilitatorApi.resetSettings()
};

export default profileApi;
