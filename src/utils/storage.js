/**
 * Utility functions for localStorage operations
 */

export class StorageManager {
    constructor() {
        this.MATCH_HISTORY_KEY = 'billiards_match_history';
    }

    /**
     * Get match history from localStorage
     * @returns {Array} Array of match objects
     */
    getMatchHistory() {
        try {
            const history = localStorage.getItem(this.MATCH_HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error reading match history:', error);
            return [];
        }
    }

    /**
     * Save match history to localStorage
     * @param {Array} history - Array of match objects
     */
    saveMatchHistory(history) {
        try {
            localStorage.setItem(this.MATCH_HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Error saving match history:', error);
        }
    }

    /**
     * Add a new match to history
     * @param {Object} match - Match object to add
     */
    addMatch(match) {
        const history = this.getMatchHistory();
        history.push(match);
        this.saveMatchHistory(history);
    }

    /**
     * Clear all match history
     */
    clearHistory() {
        try {
            localStorage.removeItem(this.MATCH_HISTORY_KEY);
        } catch (error) {
            console.error('Error clearing match history:', error);
        }
    }

    /**
     * Migrate old history entries to include dates
     */
    migrateHistory() {
        const history = this.getMatchHistory();
        const now = new Date();
        const defaultDate = this.formatDateTime(now);
        
        const migratedHistory = history.map(match => {
            if (!match.date) {
                return { ...match, date: defaultDate };
            }
            return match;
        });
        
        this.saveMatchHistory(migratedHistory);
    }

    /**
     * Format date and time for display
     * @param {Date} date - Date object to format
     * @returns {string} Formatted date string
     */
    formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
}
