/**
 * SoundManager class for playing various sound effects in the application.
 */
export class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {}

  constructor() {
    this.loadSounds()
  }

  /**
   * Loads all necessary sound files.
   */
  private loadSounds(): void {
    this.sounds = {
      start: new Audio("/sounds/start.mp3"),
      point: new Audio("/sounds/point.mp3"),
      win: new Audio("/sounds/win.mp3"),
      lose: new Audio("/sounds/lose.mp3"),
      reset: new Audio("/sounds/reset.mp3"),
      buttonClick: new Audio("/sounds/button_click.mp3"),
    }

    // Optional: Preload sounds to avoid delay on first play
    for (const key in this.sounds) {
      this.sounds[key].load()
    }
  }

  /**
   * Plays a specific sound.
   * @param soundName The name of the sound to play (e.g., 'start', 'point', 'win').
   */
  public playSound(soundName: string): void {
    const sound = this.sounds[soundName]
    if (sound) {
      // Reset current time to play from beginning if already playing
      sound.currentTime = 0
      sound.play().catch((error) => console.warn(`Failed to play sound ${soundName}:`, error))
    } else {
      console.warn(`Sound "${soundName}" not found.`)
    }
  }

  // Specific methods for convenience
  public playStartSound(): void {
    this.playSound("start")
  }

  public playPointSound(): void {
    this.playSound("point")
  }

  public playWinSound(): void {
    this.playSound("win")
  }

  public playLoseSound(): void {
    this.playSound("lose")
  }

  public playResetSound(): void {
    this.playSound("reset")
  }

  public playButtonClickSound(): void {
    this.playSound("buttonClick")
  }
}
