[![CircleCi](https://circleci.com/gh/vschoener/molecule-parser-js/tree/master.svg?style=svg)](https://circleci.com/gh/vschoener/molecule-parser-js) [![codecov](https://codecov.io/gh/vschoener/molecule-parser-js/branch/master/graph/badge.svg)](https://codecov.io/gh/vschoener/molecule-parser-js)

# Molecule parser

This is a technical test I had make at home.

## Install

Project used nodenv to fixe the node version locally. Once installed simply run

```bash
npm install
```

/!\ If nodenv is not installed, it will use your default node version

## Run

```bash
# To start watching the code
npm run start:dev


# To start watching the code with test
npm run test:watch
```

## Build

```bash
# build
npm run build
```

## Subject

For a given chemical formula represented by a string, count the number of atoms of each element contained in the molecule and return a dict.

For example:

```ts
const water = 'H2O';
parseMolecule(water);

# return {'H': 2, 'O': 1}

const magnesiumHydroxide = 'Mg(OH)2';
parseMolecule(magnesiumHydroxide);

# return {'Mg': 1, 'O': 2, 'H': 2}

const fremySalt = 'K4[ON(SO3)2]2';
parseMolecule(fremySalt);

# return {'K': 4, 'O': 14, 'N': 2, 'S': 4}
```

As you can see, some formulas have brackets in them. The index outside the brackets tells you that you have to multiply count of each atom inside the bracket on this index. For example, in Fe(NO3)2 you have one iron atom, two nitrogen atoms and six oxygen atoms.

Note that brackets may be round, square or curly and can also be nested. Index after the braces is optional.

Send us your work in an archive, in private gist file(s) or using an other private solution.
