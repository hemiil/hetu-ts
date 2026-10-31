const CHECK_ALPHABET = '0123456789ABCDEFHJKLMNPRSTUVWXY';

/** Check character for the nine digits `DDMMYY` + `ZZZ`. */
export const controlCharacter = (datePart: string, individualPart: string): string =>
  CHECK_ALPHABET.charAt(Number.parseInt(datePart + individualPart, 10) % CHECK_ALPHABET.length);
