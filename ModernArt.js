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
  CHRISTIN_P: 2,
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
    this.board = [];
    this.bid = null;
    this.cash = 100000;
  }

  play(turn) {
    this.turn = turn;
  }

  place(bid) {
    this.bid = bid;
  }

  sell(index, title, description, opt_price, opt_index, opt_title, opt_description) {
    if (!this.turn || this.turn.done) {
      // Turn already over.
      return;
    }

    if (index < 0 || index >= this.hand.length) {
      // Invalid index.
      return;
    }

    if (this.turn instanceof SpecialTurn && (this.hand[index].artist != this.turn.art.artist ||
        this.hand[index].auctionType == AuctionType.DOUBLE || opt_index != undefined)) {
      // Special turn, expecting only one art matching artist and cannot be of type DOUBLE.
      return;
    }

    if (opt_index != undefined) {
      if (opt_index < 0 || opt_index >= this.hand.length) {
        // Invalid index.
        return;
      }

      const art = this.hand[index];
      const secondArt = this.hand[opt_index];

      if (art.auctionType != AuctionType.DOUBLE || secondArt.auctionType == AuctionType.DOUBLE) {
        // Invalid art types.
        return;
      }

      if (art.artist != secondArt.artist) {
        // Non-matching artists.
        return;
      }

      if (this.game.soldPieces[this.game.phase][art.artist] == 4) {
        // Already 4 pieces of art by this artist, cannot sell 2.
        return;
      }
    }

    let art, opt_art;
    if (index > opt_index || opt_index == undefined) {
      art = this.hand.splice(index, 1)[0];
      if (opt_index != undefined) {
        opt_art = this.hand.splice(opt_index, 1)[0];
      }
    } else {
      opt_art = this.hand.splice(opt_index, 1)[0];
      art = this.hand.splice(index, 1)[0];
    }

    this.turn.sell(
        art, title, description, opt_price, opt_art, opt_title, opt_description);
  }
}

class Bid {
  constructor(turn, art, index, opt_art) {
    this.turn = turn;
    this.art = art;
    this.index = index;
    this.secondArt = opt_art;
    this.done = false;
  }
}

class YesNoBid extends Bid {
  constructor(turn, art, index, amount, opt_art) {
    super(turn, art, index, opt_art);
    this.amount = amount;
  }

  yes() {
    if (this.done) {
      return;
    }
    this.done = true;

    if (this.turn.game.players[this.index].cash >= this.amount) {
      this.turn.game.soldPieces[this.turn.game.phase][this.art.artist]++;
      this.turn.game.players[this.turn.game.currentPlayer].cash += this.amount;
      this.turn.game.players[this.index].cash -= this.amount;
      this.turn.game.players[this.index].board.push(this.art);
      if (this.secondArt) {
        this.turn.game.soldPieces[this.turn.game.phase][this.secondArt.artist]++;
        this.turn.game.players[this.index].board.push(this.secondArt);
      }
      this.turn.game.endTurn();
    } else {
      this.done = false;
      this.no();
    }
  }

  no() {
    if (this.done) {
      return;
    }
    this.done = true;

    const nextIndex = (this.index + 1) % this.turn.game.players.length;
    if (nextIndex == this.turn.game.currentPlayer) {
      this.turn.game.soldPieces[this.turn.game.phase][this.art.artist]++;
      this.turn.game.players[nextIndex].cash -= this.amount;
      this.turn.game.players[nextIndex].board.push(this.art);
      if (this.secondArt) {
        this.turn.game.soldPieces[this.turn.game.phase][this.secondArt.artist]++;
        this.turn.game.players[nextIndex].board.push(this.secondArt);
      }
      this.turn.game.endTurn();
    } else {
      this.turn.game.players[nextIndex].place(
          new YesNoBid(this.turn, this.art, nextIndex, this.amount, this.secondArt));
    }
  }
}

class BlindBidResolver {
  constructor(turn, art, opt_art) {
    this.turn = turn;
    this.art = art;
    this.secondArt = opt_art;
    this.bids = [];
    this.pending = [];

    for (let i = 0; i < turn.game.players.length; i++) {
      this.bids.push(0);
      this.pending.push(true);
    }
  }

  bid(index, amount) {
    this.bids[index] = amount;
    this.pending[index] = false;

    if (this.pending.every(x => !x)) {
      const max = this.bids.reduce((x, y) => x > y ? x : y);
      const numPlayers = this.turn.game.players.length;
      for (let i = 0; i < numPlayers; i++) {
        const currentPlayer = this.turn.game.currentPlayer;
        const j = (i + currentPlayer) % numPlayers;
        if (this.bids[j] == max) {
          if (j == currentPlayer) {
            this.turn.game.soldPieces[this.turn.game.phase][this.art.artist]++;
            this.turn.game.players[currentPlayer].cash -= max;
            this.turn.game.players[currentPlayer].board.push(this.art);
            if (this.secondArt) {
              this.turn.game.soldPieces[this.turn.game.phase][this.secondArt.artist]++;
              this.turn.game.players[currentPlayer].board.push(this.secondArt);
            }
          } else {
            this.turn.game.soldPieces[this.turn.game.phase][this.art.artist]++;
            this.turn.game.players[currentPlayer].cash += max;
            this.turn.game.players[j].cash -= max;
            this.turn.game.players[j].board.push(this.art);
            if (this.secondArt) {
              this.turn.game.soldPieces[this.turn.game.phase][this.secondArt.artist]++;
              this.turn.game.players[j].board.push(this.secondArt);
            }
          }
          this.turn.game.endTurn();
          return;
        }
      }
    }
  }
}

class BlindBid extends Bid {
  constructor(turn, art, index, resolver, opt_art) {
    super(turn, art, index, opt_art);
    this.resolver = resolver;
  }

  bid(amount) {
    if (this.done) {
      return;
    }
    this.done = true;

    if (this.turn.game.players[this.index].cash < amount) {
      amount = this.turn.game.players[this.index].cash;
    }
    this.resolver.bid(this.index, amount);
  }
}

class SinglePassBid extends Bid {
  constructor(turn, art, index, previousBidder, previousBid, opt_art) {
    super(turn, art, index, opt_art);
    this.previousBidder = previousBidder;
    this.previousBid = previousBid;
  }

  bid(amount) {
    if (this.done) {
      return;
    }
    this.done = true;

    if (this.turn.game.players[this.index].cash < amount) {
      amount = this.turn.game.players[this.index].cash;
    }
    if (amount < this.previousBid) {
      this.done = false;
      this.pass();
      return;
    }

    if (this.index == this.turn.game.currentPlayer) {
      this.turn.game.soldPieces[this.turn.game.phase][this.art.artist]++;
      this.turn.game.players[this.index].cash -= amount;
      this.turn.game.players[this.index].board.push(this.art);
      if (this.secondArt) {
        this.turn.game.soldPieces[this.turn.game.phase][this.secondArt.artist]++;
        this.turn.game.players[this.index].board.push(this.secondArt);
      }
      this.turn.game.endTurn();
    } else {
      const nextIndex = (this.index + 1) % this.turn.game.players.length;
      this.turn.game.players[nextIndex].place(new SinglePassBid(
          this.turn, this.art, nextIndex, this.index, amount, this.secondArt));
    }
  }

  pass() {
    if (this.done) {
      return;
    }
    this.done = true;

    const nextIndex = (this.index + 1) % this.turn.game.players.length;

    if (this.index == this.turn.game.currentPlayer ||
        nextIndex == this.previousBidder /* only possible if all passed */) {
      this.turn.game.soldPieces[this.turn.game.phase][this.art.artist]++;
      this.turn.game.players[this.index].cash += this.previousBid;
      this.turn.game.players[this.previousBidder].cash -= this.previousBid;
      this.turn.game.players[this.previousBidder].board.push(this.art);
      if (this.secondArt) {
        this.turn.game.soldPieces[this.turn.game.phase][this.secondArt.artist]++;
        this.turn.game.players[this.previousBidder].board.push(this.secondArt);
      }
      this.turn.game.endTurn();
    } else {
      this.turn.game.players[nextIndex].place(
          new SinglePassBid(this.turn, this.art, nextIndex, this.previousBidder,
              this.previousBid));
    }
  }
}

class Auctioneer {
  constructor(turn, art, bidder, bid, opt_art) {
    this.turn = turn;
    this.art = art;
    this.secondArt = opt_art;
    this.currentBidder = bidder;
    this.currentBid = bid;
    this.bids = [];
    this.pending = [];
    this.done = false;

    for (let i = 0; i < turn.game.players.length; i++) {
      this.pending.push(true);
    }
  }

  register(bid, index) {
    this.bids[index] = bid;
  }

  bid(index, amount) {
    if (this.done) {
      return;
    }

    if (amount > this.turn.game.players[index].cash) {
      amount = this.turn.game.players[index].cash;
    }
    if (amount <= this.currentBid || index == this.currentBidder) {
      return;
    }

    this.pending[index] = false;
    this.currentBid = amount;
    this.currentBidder = index;

    for (let i = 0; i < this.turn.game.players.length; i++) {
      if (i != index) {
        this.pending[i] = true;
      }
      this.bids[i].update(index, amount);
    }
  }

  pass(index) {
    if (this.done) {
      return;
    }

    this.pending[index] = false;

    if (this.pending.every(x => !x)) {
      const currentPlayer = this.turn.game.currentPlayer;
      if (this.currentBidder == currentPlayer) {
        this.turn.game.soldPieces[this.turn.game.phase][this.art.artist]++;
        this.turn.game.players[currentPlayer].cash -= this.currentBid;
        this.turn.game.players[currentPlayer].board.push(this.art);
        if (this.secondArt) {
          this.turn.game.soldPieces[this.turn.game.phase][this.secondArt.artist]++;
          this.turn.game.players[currentPlayer].board.push(this.secondArt);
        }
      } else {
        this.turn.game.soldPieces[this.turn.game.phase][this.art.artist]++;
        this.turn.game.players[currentPlayer].cash += this.currentBid;
        this.turn.game.players[this.currentBidder].cash -= this.currentBid;
        this.turn.game.players[this.currentBidder].board.push(this.art);
        if (this.secondArt) {
          this.turn.game.soldPieces[this.turn.game.phase][this.secondArt.artist]++;
          this.turn.game.players[this.currentBidder].board.push(this.secondArt);
        }
      }
      this.done = true;
      this.turn.game.endTurn();
    }
  }
}

class OpenBid extends Bid {
  constructor(turn, art, index, auctioneer, bidder, bid, opt_art) {
    super(turn, art, index, opt_art);
    this.auctioneer = auctioneer;
    auctioneer.register(this, index);
    this.currentBidder = bidder;
    this.currentBid = bid;
  }

  update(index, amount) {
    this.currentBidder = index;
    this.currentBid = amount;
  }

  bid(amount) {
    if (this.turn.game.players[this.index].cash < amount) {
      amount = this.turn.game.players[this.index].cash;
    }
    this.auctioneer.bid(this.index, amount);
  }

  pass() {
    this.auctioneer.pass(this.index);
  }
}

class Turn {
  constructor(game) {
    this.game = game;
    this.done = false;
  }

  sell(art, title, description, opt_price, opt_art, opt_title, opt_description) {
    if (this.done) {
      return;
    }
    this.done = true;

    if (this.game.soldPieces[this.game.phase][art.artist] == 4 ||
        this.game.soldPieces[this.game.phase][art.artist] == 3 && opt_art) {
      this.game.soldPieces[this.game.phase][art.artist] = 5;
      this.game.endPhase();
      return;
    }

    const nextIndex = (this.game.currentPlayer + 1) % this.game.players.length;

    if (art.auctionType == AuctionType.DOUBLE) {
      if (!opt_art) {
        const originator = this.game.currentPlayer;
        this.game.currentPlayer = nextIndex;
        this.game.players[this.game.currentPlayer].play(
            new SpecialTurn(this.game, art, title, description, originator));
      } else {
        const temp = opt_art;
        opt_art = art;
        art = temp;
      }
    }

    switch(art.auctionType) {
      case AuctionType.OPEN:
        const auctioneer =
            new Auctioneer(this, art, this.game.currentPlayer, opt_price, opt_art);
        for (let i = 0; i < this.game.players.length; i++) {
          this.game.players[i].place(new OpenBid(
              this, art, i, auctioneer, this.game.currentPlayer, opt_price, opt_art));
        }
        break;
      case AuctionType.ONCE:
        this.game.players[nextIndex].place(
            new SinglePassBid(
                this, art, nextIndex, this.game.currentPlayer, 0, opt_art));
        break;
      case AuctionType.BLIND:
        const resolver = new BlindBidResolver(this, art, opt_art);
        for (let i = 0; i < this.game.players.length; i++) {
          this.game.players[i].place(new BlindBid(this, art, i, resolver, opt_art));
        }
        break;
      case AuctionType.PRICE:
        this.game.players[nextIndex].place(
            new YesNoBid(this, art, nextIndex, opt_price, opt_art));
        break;
    }
  }
}

class SpecialTurn extends Turn {
  constructor(game, art, title, description, originator) {
    super(game);
    this.art = art;
    this.title = title;
    this.description = description;
    this.originator = originator;
  }

  pass() {
    if (this.done) {
      return;
    }
    this.done = true;

    const nextIndex = (this.game.currentPlayer + 1) % this.game.players.length;
    if (nextIndex == this.originator) {
      this.game.soldPieces[this.game.phase][this.art.artist]++;
      this.game.players[this.originator].board.push(this.art);
      this.game.currentPlayer = nextIndex;
      this.game.endTurn();
    } else {
      this.game.currentPlayer = nextIndex;
      this.game.players[this.game.currentPlayer].play(
          new SpecialTurn(this.game, this.art, this.title, this.description, this.originator));
    }
  }

  sell(art, title, description, opt_price) {
    super.sell(this.art, this.title, this.description, opt_price, art, title, description);
  }
}

class ModernArt {
  static get DECK() {
    const deck = [];

    const hasThirdCard = function(artist, auctionType) {
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
        case Artist.CHRISTIN_P:
          return auctionType != AuctionType.DOUBLE;
      }
      return true;
    };

    for (let a in Artist) {
      for (let t in AuctionType) {
        const artist = Artist[a], auctionType = AuctionType[t];
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
    // Value of art pieces for each phase (cummulative)
    this.valueBoard = [
      [0, 0, 0, 0], // LITE_METAL
      [0, 0, 0, 0], // YOKO
      [0, 0, 0, 0], // CHRISTIN_P
      [0, 0, 0, 0], // KARL_GITTER
      [0, 0, 0, 0]  // KRYPTO
    ];
    this.soldPieces = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    this.currentPlayer = 0;
  }

  random(space) {
    const x = Math.sin(this.seed++) * 10000;
    return Math.floor((x - Math.floor(x)) * space);
  }

  shuffle() {
    const deck = ModernArt.DECK.slice(0);
    for (let i = 0; i < 200; i++) {
      deck.push(deck.splice(this.random(deck.length), 1)[0]);
    }
    return deck;
  }

  addPlayer(name) {
    if (this.players.length < 5) {
      const newPlayer = new Player(name, this, this.players.length);
      this.players.push(newPlayer);
      return newPlayer;
    }
    return null;
  }

  start() {
    if (this.players.length < 3) {
      return;
    }
    this.newPhase();
  }

  newPhase() {
    this.deal();
    this.players[this.currentPlayer].play(new Turn(this));
  }

  deal() {
    const numPlayers = this.players.length;
    for (let i = 0; i < numPlayers; i++) {
      Array.prototype.push.apply(
          this.players[i].hand,
          this.deck.splice(
              0, ModernArt.NUMBER_OF_CARDS[numPlayers][this.phase]));
    }
  }

  endTurn() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    this.players[this.currentPlayer].play(new Turn(this));
  }

  endPhase() {
    // Update value board
    let pieces = 5;
    const winners = [];
    while(winners.length < 3 && pieces >= 0) {
      for (let i = 0; i < 5; i++) {
        if (this.soldPieces[this.phase][i] == pieces) {
          winners.push(i);
        }
      }
      pieces--;
    }
    for (let i = 0; i < 3; i++) {
      this.valueBoard[winners[i]][this.phase] = 30000 - i * 10000 +
          this.valueBoard[winners[i]].reduce((x, y) => x + y);
    }

    // Dispense cash
    for (let i = 0; i < this.players.length; i++) {
      for (let j = 0; j < this.players[i].board.length; j++) {
        this.players[i].cash +=
            this.valueBoard[this.players[i].board[j].artist][this.phase];
      }
      this.players[i].board = [];
    }

    if (this.phase < 3) {
      this.phase++;
      this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
      this.newPhase();
    } else {
      this.endGame();
    }
  }

  endGame() {}
}