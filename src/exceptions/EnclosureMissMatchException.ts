export class EnclosureMissMatchException extends Error {
  public matchedSubMolecule: string[];

  public constructor(message: string, matchedSubMolecule: string[]) {
    super(message);

    this.matchedSubMolecule = matchedSubMolecule;
  }
}
