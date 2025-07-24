import "./styles/main.css"
import { StorageManager } from "./utils/storage.js"
import { Tournament } from "./components/Tournament.js"
import { MatchHistory } from "./components/MatchHistory.js"
import { StatsChart } from "./components/StatsChart.js"
import { UI } from "./components/UI.js"

/**
 * Main application initialization
 */
class BilliardsApp {
  constructor() {
    this.storageManager = new StorageManager()
    this.tournament = new Tournament(this.storageManager)
    this.matchHistory = new MatchHistory(this.storageManager, null) // Will be updated after statsChart creation
    this.statsChart = new StatsChart(this.matchHistory)
    this.matchHistory.statsChart = this.statsChart // Set reference after creation
    this.ui = new UI(this.tournament, this.matchHistory, this.statsChart)
  }

  /**
   * Initialize the application
   */
  init() {
    this.ui.initialize()
    console.log("Billiards Tournament App initialized successfully!")
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const app = new BilliardsApp()
  app.init()
})
