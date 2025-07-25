/**
 * Date utility functions
 */

export class DateUtils {
  /**
   * Format date for display in match history
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  static formatMatchDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  /**
   * Get current date as formatted string
   * @returns {string} Current date formatted for display
   */
  static getCurrentDateString(): string {
    return this.formatMatchDate(new Date())
  }

  /**
   * Check if a date string matches a filter date
   * @param {string} dateString - Full date string to check (e.g., "YYYY-MM-DD HH:MM")
   * @param {string} filterDate - Date filter (YYYY-MM-DD format)
   * @returns {boolean} True if dates match
   */
  static matchesDateFilter(dateString: string, filterDate: string): boolean {
    if (!dateString || !filterDate) return false
    return dateString.startsWith(filterDate)
  }

  /**
   * Parse date from input value
   * @param {string} dateValue - Date input value
   * @returns {Date|null} Parsed date or null if invalid
   */
  static parseDateInput(dateValue: string): Date | null {
    if (!dateValue) return null
    try {
      return new Date(dateValue)
    } catch (error) {
      console.error("Error parsing date:", error)
      return null
    }
  }

  /**
   * Get date in YYYY-MM-DD format for input fields
   * @param {Date} date - Date to format
   * @returns {string} Date in YYYY-MM-DD format
   */
  static toInputFormat(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }
}
