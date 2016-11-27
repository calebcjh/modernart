const AuctionType = {
  OPEN: 'OPEN',
  ONCE: 'ONCE',
  BLIND: 'BLIND',
  PRICE: 'PRICE',
  DOUBLE: 'DOUBLE'
};

const Artist = {
  LITE_METAL: 0,
  YOKO: 1,
  CHRISTINE_P: 2,
  KARL_GITTER: 3,
  KRYPTO: 4
};

class ArtPiece {
  constructor(artist, auctionType) {
    this.artist = artist;
    this.auctionType = auctionType;
  }
};

class Player {
  constructor(name, game, index) {
    this.name = name;
    this.game = game;
    this.index = index;
    this.hand = [];
    this.turn = null;
  }
  
  play(turn) {
    this.turn = turn;
  }
  
  sell(index, title, description) {
    if (index >= 0 && index < this.hand.length &&
        this.turn && !this.turn.done) {
      this.turn.sell(this.hand[index], title, description);
    }
  }
}

class Turn {
  constructor(game) {
    this.game = game;
  }
  
  sell(art, title, description, opt_price) {
    switch(art.auctionType) {
      case AuctionType.OPEN:
        // TODO
      case AuctionType.ONCE:
        // TODO
      case AuctionType.BLIND:
        // TODO
      case AuctionType.PRICE:
        // TODO
      case AuctionType.DOUBLE:
        // TODO
    }
  }
}

class ModernArt {
  static get DECK() {
    var deck = [];

    var hasThirdCard = function(artist, auctionType) {
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
    };

    for (var a in Artist) {
      for (var t in AuctionType) {
        var artist = Artist[a], auctionType = AuctionType[t];
        deck.push(new ArtPiece(artist, auctionType));
        deck.push(new ArtPiece(artist, auctionType));
        if (hasThirdCard(artist, auctionType)) {
          deck.push(new ArtPiece(artist, auctionType));
        }
      }
    }

    // Krypto has a 4th open auction card.
    deck.push(new ArtPiece(Artist.KRYPTO, AuctionType.OPEN));
    
    return deck;
  }
  
  // Number of cards to deal at the beginning of phases.
  // 3 players: 10, 6, 6
  // 4 players: 9, 4, 4
  // 5 players: 8, 3, 3
  static get NUMBER_OF_CARDS() {
    return [
        null, null,
        null,         // TODO: Implement 2 player variant
        [10, 6, 6, 0],
        [9, 4, 4, 0],
        [8, 3, 3, 0],
        [7, 2, 2, 0], // Unofficial
        [6, 2, 2, 0]  // Unofficial
    ];
  }

  constructor(seed) {
    this.seed = seed;
    this.deck = this.shuffle();
    this.players = [];
    this.phase = 0;
    this.valueBoard = [
      [0, 0, 0, 0], // LITE_METAL
      [0, 0, 0, 0], // YOKO
      [0, 0, 0, 0], // CHRISTINE_P
      [0, 0, 0, 0], // KARL_GITTER
      [0, 0, 0, 0]  // KRYPTO
    ];
    this.soldPieces = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    this.currentSeller = 0;
  }

  random(space) {
    var x = Math.sin(this.seed++) * 10000;
    return Math.floor((x - Math.floor(x)) * space);
  }

  shuffle() {
    var deck = ModernArt.DECK.slice(0);
    for (var i = 0; i < 200; i++) {
      deck.push(deck.splice(this.random(deck.length), 1)[0]);
    }
    return deck;
  }

  addPlayer(name) {
    if (this.players.length < 5) {
      var newPlayer = new Player(name, this, this.players.length);
      this.players.push(newPlayer);
      return newPlayer;
    }
    return null;
  }

  start() {
    this.deal();
    this.players[0].play(new Turn(this));
  }
  
  deal() {
    var numPlayers = this.players.length;
    for (var i = 0; i < numPlayers; i++) {
      Array.prototype.push.apply(
          this.players[i].hand,
          this.deck.splice(
              0, ModernArt.NUMBER_OF_CARDS[numPlayers][this.phase]));
    }
  }
}