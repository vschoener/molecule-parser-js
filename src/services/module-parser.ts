/**
 * The logic is to first go through each "sub molecule pattern" to rewrite them in a simple form
 *  - ex: Mg(OH)2 become MgO2H2
 * It uses recursive through ech molecule string until we can't match sub pattern
 * Then we replace the pattern by the easier form in the string
 *
 * And finally we create and returns a dataset from the easier updated molecule form
 */

import { EnclosureMissMatchException } from '../exceptions/EnclosureMissMatchException';

const enclosures = {
  '[': ']',
  '(': ')',
  '{': '}',
};

// This Regex will match each possible subset of molecule using lazy
const extractSubMoleculeRegex = /([([{])([\w]*)([\])}])(\d*)/g;

/**
 * This regex extract atoms from molecule
 * We could have restricted this match only outside of sub molecule "{(["
 */
const extractAtomsRegex = /([A-Z]{1}[a-z]*)(\d*)/g;

/**
 * Contain isolated module without any sub pattern
 * Ex: for matched molecule of Mg(OH)2
 * - pattern: (OH)2
 * - molecule: OH
 * - multiplyInnerAtomsBy: 2
 */
export interface MatchedMolecule {
  pattern: string;
  molecule: string;
  multiplyInnerAtomsBy: number;
  moleculeWithMultiplier: string;
}

/**
 * Extract the sub molecules of the molecule
 */
export const extractSubMolecules = (
  molecule: string,
): Map<string, MatchedMolecule> => {
  const matchedSubMolecules = molecule.matchAll(extractSubMoleculeRegex);

  const formattedMolecules = new Map<string, MatchedMolecule>();
  for (const matchedSubMolecule of matchedSubMolecules) {
    const [
      pattern,
      startByEnclosure,
      molecule,
      endByEnclosure,
      atomMultiplier,
    ] = matchedSubMolecule;

    if (enclosures[startByEnclosure] !== endByEnclosure) {
      throw new EnclosureMissMatchException(
        'Parsing issue with open and close sub molecule',
        matchedSubMolecule,
      );
    }

    const multiplier = Number(atomMultiplier || 1);
    formattedMolecules.set(pattern, {
      pattern,
      molecule,
      multiplyInnerAtomsBy: multiplier,
      // We could updateAtoms later but it created other O(n), so to save some performance it's done here
      moleculeWithMultiplier: updateAtomsFromMultiplier(molecule, multiplier),
    });
  }

  return formattedMolecules;
};

/**
 * Extract atoms of the molecule
 */
export const extractAtoms = (
  molecule: string,
): IterableIterator<RegExpMatchArray> => {
  return molecule.matchAll(extractAtomsRegex);
};

export const updateAtomsFromMultiplier = (
  molecule: string,
  multiplier: number,
): string => {
  const extractedAtoms = extractAtoms(molecule);

  const atomsUpdated = [];
  for (const [, atomName, atomNumber] of extractedAtoms) {
    atomsUpdated.push(`${atomName}${Number(atomNumber || 1) * multiplier}`);
  }

  return atomsUpdated.join('');
};

/**
 * Responsible of flatten all sub molecule updating their atoms multiplier
 */
export const rewriteSubMolecules = (molecule: string): string => {
  const subMolecules = extractSubMolecules(molecule);

  // Get out of the recursive call once no matches from last updated molecule string
  if (!subMolecules.size) {
    return molecule;
  }

  console.log([...subMolecules.keys()]);

  const rewrittenMolecule = [...subMolecules.keys()].reduce(
    (updatedMolecule, currentPattern) =>
      updatedMolecule.replace(
        currentPattern,
        subMolecules.get(currentPattern).moleculeWithMultiplier,
      ),
    molecule,
  );

  return rewriteSubMolecules(rewrittenMolecule);
};

/**
 * Main call of this module to parse a molecule
 */
export const parseMolecule = (molecule: string): Map<string, number> => {
  const updatedMolecule = rewriteSubMolecules(molecule);
  const atoms = extractAtoms(updatedMolecule);

  const parsedMolecules = new Map<string, number>();
  for (const result of atoms) {
    const [, atomName, atomNumber] = result;
    const existingAtomValue = parsedMolecules.get(atomName) ?? 0;

    parsedMolecules.set(atomName, existingAtomValue + Number(atomNumber || 1));
  }

  return parsedMolecules;
};
