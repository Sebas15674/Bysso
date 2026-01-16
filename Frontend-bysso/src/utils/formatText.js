/**
 * Convierte un string de SNAKE_CASE a Title Case, con manejo especial para '_y_'.
 * Ejemplo: 'HOLA_MUNDO' -> 'Hola Mundo'
 * Ejemplo: 'HOLA_Y_MUNDO' -> 'Hola y Mundo'
 * @param {string} str El string a convertir.
 * @returns {string} El string formateado.
 */
export const snakeToTitleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .replace(/_y_/g, ' y ') // Manejar el caso especial '_y_'
    .replace(/_/g, ' ')     // Reemplazar el resto de los guiones bajos
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalizar la primera letra de cada palabra
};
