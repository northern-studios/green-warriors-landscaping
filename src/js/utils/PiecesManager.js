// Registry of every mounted custom element, keyed by component name then instance id.
// The Page renderer broadcasts lifecycle calls (ready, resize, scroll, update…) through it.
class PiecesManager {
  constructor() {
    this.loadedPiecesCount = 0;
    this.piecesCount = 0;
    this.currentPieces = {};
  }

  addPiece(piece) {
    if (typeof this.currentPieces[piece.name] !== 'object') this.currentPieces[piece.name] = {};
    this.currentPieces[piece.name][piece.id] = piece;
  }

  removePiece(piece) {
    delete this.currentPieces[piece.name][piece.id];
  }
}

export default new PiecesManager();
