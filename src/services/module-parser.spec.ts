import {
  extractAtoms,
  extractSubMolecules,
  MatchedMolecule,
  parseMolecule,
  rewriteSubMolecules,
  updateAtomsFromMultiplier,
} from './module-parser';

describe('Molecule Parser Service', () => {
  describe('extractSubMolecules', () => {
    it('should return empty map of sub molecules if not match', () => {
      const result = new Map<string, MatchedMolecule>([]);

      expect(extractSubMolecules('Mg')).toEqual(result);
    });

    it('should return a map of sub molecules when multiple same match', () => {
      const result = new Map<string, MatchedMolecule>([
        [
          '(OH)2',
          {
            pattern: '(OH)2',
            molecule: 'OH',
            multiplyInnerAtomsBy: 2,
            moleculeWithMultiplier: 'O2H2',
          },
        ],
      ]);

      expect(extractSubMolecules('Mg(OH)2Mg(OH)2')).toEqual(result);
    });

    it('should return a map of sub molecules when multiple different match', () => {
      const result = new Map<string, MatchedMolecule>([
        [
          '(OH)2',
          {
            pattern: '(OH)2',
            molecule: 'OH',
            multiplyInnerAtomsBy: 2,
            moleculeWithMultiplier: 'O2H2',
          },
        ],
        [
          '(CiOh2)3',
          {
            pattern: '(CiOh2)3',
            molecule: 'CiOh2',
            multiplyInnerAtomsBy: 3,
            moleculeWithMultiplier: 'Ci3Oh6',
          },
        ],
      ]);

      expect(extractSubMolecules('Mg(OH)2H(CiOh2)3')).toEqual(result);
    });

    it('should return a map of sub molecules when only will match', () => {
      const result = new Map<string, MatchedMolecule>([
        [
          '(OH)2',
          {
            pattern: '(OH)2',
            molecule: 'OH',
            multiplyInnerAtomsBy: 2,
            moleculeWithMultiplier: 'O2H2',
          },
        ],
      ]);

      expect(extractSubMolecules('Mg(OH)2')).toEqual(result);
    });
  });

  describe('extractAtoms', () => {
    it('should extract atoms', () => {
      // Iterator area bit tricky to test with the Equal below, so we map the important data
      const result = Array.from(extractAtoms('H2OCi1')).map((data) => [
        data[0],
        data[1],
        data[2],
      ]);

      expect(result).toEqual([
        ['H2', 'H', '2'],
        ['O', 'O', ''],
        ['Ci1', 'Ci', '1'],
      ]);
    });

    it('should extract atoms and return empty if not match', () => {
      // Iterator area bit tricky to test with the Equal below, so we map the important data
      const result = Array.from(extractAtoms('nop')).map((data) => [
        data[0],
        data[1],
        data[2],
      ]);

      expect(result).toEqual([]);
    });

    it('should extract atoms even with sub molecule', () => {
      /**
       * This case is not used with the main logic but prove it works that way as well
       */
      const result = Array.from(extractAtoms('Mg(OH)2')).map((data) => [
        data[0],
        data[1],
        data[2],
      ]);

      expect(result).toEqual([
        ['Mg', 'Mg', ''],
        ['O', 'O', ''],
        ['H', 'H', ''],
      ]);
    });
  });

  describe('updateAtomsFromMultiplier', () => {
    it('should update the molecule according to its multiplier', () => {
      expect(updateAtomsFromMultiplier('OH', 2)).toEqual('O2H2');
    });

    it('should update the molecule containing multiplied atoms according to its multiplier', () => {
      expect(updateAtomsFromMultiplier('SO3', 2)).toEqual('S2O6');
    });

    it('should returns empty string if no atoms match the molecule', () => {
      expect(updateAtomsFromMultiplier('oops', 2)).toEqual('');
    });
  });

  describe('rewriteSubMolecules', () => {
    it('should not rewrite the molecule if the form is already the easy form', () => {
      expect(rewriteSubMolecules('H2O')).toEqual('H2O');
    });

    it('should rewrite the molecule Mg(OH)2 into an easier form', () => {
      expect(rewriteSubMolecules('Mg(OH)2')).toEqual('MgO2H2');
    });

    it('should rewrite the molecule ON(SO3)2 into an easier form', () => {
      expect(rewriteSubMolecules('ON(SO3)2')).toEqual('ONS2O6');
    });

    it('should rewrite the molecule K4[ON(SO3)2]2 into an easier form', () => {
      expect(rewriteSubMolecules('K4[ON(SO3)2]2')).toEqual('K4O2N2S4O12');
    });
  });

  describe('parseMolecule', () => {
    it('should parse H2O', () => {
      expect(parseMolecule('H2O')).toEqual(
        new Map([
          ['H', 2],
          ['O', 1],
        ]),
      );
    });

    it('should parse Mg(OH)2', () => {
      expect(parseMolecule('Mg(OH)2')).toEqual(
        new Map([
          ['Mg', 1],
          ['O', 2],
          ['H', 2],
        ]),
      );
    });

    it('should parse K4[ON(SO3)2]2', () => {
      expect(parseMolecule('K4[ON(SO3)2]2')).toEqual(
        new Map([
          ['K', 4],
          ['O', 14],
          ['N', 2],
          ['S', 4],
        ]),
      );
    });
  });
});
