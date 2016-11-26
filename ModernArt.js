const AuctionType = {
  OPEN: 'OPEN',
  ONCE: 'ONCE',
  BLIND: 'BLIND',
  PRICE: 'PRICE',
  DOUBLE: 'DOUBLE'
};

const Artist = {
  LITE_METAL: 12,
  YOKO: 13,
  CHRISTINE_P: 14,
  KARL_GITTER: 15,
  KRYPTO: 16
};

class ArtPiece {
  constructor(artist, auctionType) {
    this.artist = artist;
    this.auctionType = auctionType;
  }
};

const Deck = [];

function hasThirdCard(artist, auctionType) {
  switch(artist) {
    case Artist.LITE_METAL:
      switch(auctionType) {
        case AuctionType.PRICE:
        case AuctionType.BLIND:
        case AuctionType.DOUBLE:
          return false;
      }
      break;
    case Artist.YOKO:
      switch(auctionType) {
        case AuctionType.ONCE:
        case AuctionType.DOUBLE:
          return false;
      }
      break;
    case Artist.CHRISTINE_P:
      return auctionType != AuctionType.DOUBLE;
  }
  return true;
}

for (a in Artist) {
  for (t in AuctionType) {
    var artist = Artist[a], auctionType = AuctionType[t];
    Deck.push(new ArtPiece(artist, auctionType));
    Deck.push(new ArtPiece(artist, auctionType));
    if (hasThirdCard(artist, auctionType)) {
      Deck.push(new ArtPiece(artist, auctionType));
    }
  }
}

Deck.push(new ArtPiece(Artist.KRYPTO, AuctionType.OPEN));