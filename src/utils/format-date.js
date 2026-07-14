/**
 * formatDate 함수
 *
 * @param {string} isoString - ISO 형식의 날짜 문자열 [Required]
 * @returns {string} - "YYYY.MM.DD" 형식의 날짜 문자열
 *
 * Example usage:
 * formatDate('2026-07-14T00:00:00Z') // '2026.07.14'
 */
export function formatDate(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}
