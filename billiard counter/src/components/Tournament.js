import { DateUtils } from '../utils/dateUtils.js';

/**
 * Tournament management class
 * Handles tournament logic, match progression, and player management
 */
export class Tournament {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.reset();
    }

    /**
     * Reset tournament to initial state
     */
    reset() {
        this.players = ['', '', ''];
        this.scores = [0, 0];
        this.currentMatch = 0;
        this.matchPlayers = [];
        this.firstMatchWinner = null;
        this.firstMatchLoser = null;
        this.thirdPlayer = null;
        this.finalWinner = null;
        this.secondPlace = null;
    }

    /**
     * Start tournament with given player names
     * @param {Array<string>} playerNames - Array of 3 player names
     * @returns {Object} Match setup information
     */
    startTournament(playerNames) {
        // Validate player names
        if (!this.validatePlayerNames(playerNames)) {
            throw new Error('Все имена игроков должны быть уникальными и не пустыми');
        }

        this.players = [...playerNames];
        this.currentMatch = 0;
        this.scores = [0, 0];

        // Randomly select first two players
        const indices = [0, 1, 2];
        this.matchPlayers = [];
        this.matchPlayers.push(indices.splice(Math.floor(Math.random() * indices.length), 1)[0]);
        this.matchPlayers.push(indices.splice(Math.floor(Math.random() * indices.length), 1)[0]);
        this.thirdPlayer = indices[0];

        return this.getCurrentMatchInfo();
    }

    /**
     * Validate player names are unique and not empty
     * @param {Array<string>} names - Player names to validate
     * @returns {boolean} True if valid
     */
    validatePlayerNames(names) {
        if (names.length !== 3) return false;
        
        // Check for empty names
        if (names.some(name => !name.trim())) return false;
        
        // Check for unique names
        const uniqueNames = new Set(names.map(name => name.trim().toLowerCase()));
        return uniqueNames.size === 3;
    }

    /**
     * Get current match information
     * @returns {Object} Current match details
     */
    getCurrentMatchInfo() {
        const matchTitles = ['Первый матч', 'Финал за корону', 'Матч за второе место'];
        
        let player1Index, player2Index;
        
        if (this.currentMatch === 0) {
            player1Index = this.matchPlayers[0];
            player2Index = this.matchPlayers[1];
        } else if (this.currentMatch === 1) {
            player1Index = this.firstMatchWinner;
            player2Index = this.thirdPlayer;
        } else {
            player1Index = this.firstMatchLoser;
            player2Index = this.thirdPlayer;
        }

        return {
            title: matchTitles[this.currentMatch],
            player1: this.players[player1Index],
            player2: this.players[player2Index],
            scores: [...this.scores]
        };
    }

    /**
     * Add point to a player
     * @param {number} playerNumber - Player number (1 or 2)
     */
    addPoint(playerNumber) {
        if (playerNumber === 1) {
            this.scores[0]++;
        } else if (playerNumber === 2) {
            this.scores[1]++;
        }
    }

    /**
     * Subtract point from a player
     * @param {number} playerNumber - Player number (1 or 2)
     */
    subtractPoint(playerNumber) {
        if (playerNumber === 1 && this.scores[0] > 0) {
            this.scores[0]--;
        } else if (playerNumber === 2 && this.scores[1] > 0) {
            this.scores[1]--;
        }
    }

    /**
     * Get current scores
     * @returns {Array<number>} Current scores [player1, player2]
     */
    getScores() {
        return [...this.scores];
    }

    /**
     * End current match and progress tournament
     * @returns {Object} Match result and next state
     */
    endMatch() {
        if (this.scores[0] === this.scores[1]) {
            throw new Error('Матч не может закончиться вничью! Продолжайте играть.');
        }

        // Save match to history
        const matchInfo = this.getCurrentMatchInfo();
        const matchRecord = {
            date: DateUtils.getCurrentDateString(),
            title: matchInfo.title,
            player1: matchInfo.player1,
            score1: this.scores[0],
            player2: matchInfo.player2,
            score2: this.scores[1]
        };
        
        this.storageManager.addMatch(matchRecord);

        // Determine winner and progress tournament
        const winner = this.scores[0] > this.scores[1] ? 0 : 1;
        const loser = winner === 0 ? 1 : 0;

        if (this.currentMatch === 0) {
            // First match completed
            this.firstMatchWinner = this.matchPlayers[winner];
            this.firstMatchLoser = this.matchPlayers[loser];
            this.currentMatch = 1;
            this.matchPlayers = [this.firstMatchWinner, this.thirdPlayer];
            this.scores = [0, 0];
            
            return {
                completed: false,
                nextMatch: this.getCurrentMatchInfo()
            };
        } else if (this.currentMatch === 1) {
            // Final completed
            this.finalWinner = winner === 0 ? this.firstMatchWinner : this.thirdPlayer;
            this.thirdPlayer = winner === 0 ? this.thirdPlayer : this.firstMatchWinner;
            this.currentMatch = 2;
            this.matchPlayers = [this.firstMatchLoser, this.thirdPlayer];
            this.scores = [0, 0];
            
            return {
                completed: false,
                nextMatch: this.getCurrentMatchInfo()
            };
        } else {
            // Tournament completed
            this.secondPlace = winner === 0 ? this.firstMatchLoser : this.thirdPlayer;
            
            return {
                completed: true,
                results: this.getTournamentResults()
            };
        }
    }

    /**
     * Get final tournament results
     * @returns {Object} Tournament results
     */
    getTournamentResults() {
        const thirdPlace = [0, 1, 2].find(index => 
            index !== this.finalWinner && index !== this.secondPlace
        );

        return {
            winner: this.players[this.finalWinner],
            second: this.players[this.secondPlace],
            third: this.players[thirdPlace]
        };
    }

    /**
     * Check if tournament is in progress
     * @returns {boolean} True if tournament is active
     */
    isActive() {
        return this.players.some(player => player !== '');
    }

    /**
     * Get all player names
     * @returns {Array<string>} Player names
     */
    getPlayers() {
        return [...this.players];
    }
}
