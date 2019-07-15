class ModernArtTest {
  constructor(element) {
    this.container = element;
  }

  log(pass, time, test, error) {
    const resultElement = document.createElement('div');
    if (pass) {
      resultElement.innerHTML = '<span style="color: green">[Pass]</span> ' +
          time + 'ms ' + test;
      console.log('%c[Pass]', 'color:green', time + 'ms', test);
    } else {
      resultElement.innerHTML = '<span style="color: red">[Fail]</span> ' +
          time + 'ms ' + test;
      console.log('%c[Fail]', 'color:red', time + 'ms', test);
      if (error.hasOwnProperty('expected') && error.hasOwnProperty('actual')) {
        console.log('Expected', error.expected, 'but is', error.actual);
        console.log(error.stack);
      } else if (error.stack) {
        console.log(error.stack);
      } else {
        console.log(error);
      }
    }
    this.container.appendChild(resultElement);
  }

  run() {
    let passes = 0;
    let fails = 0;
    const tests = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
        .filter(x => x.indexOf('test') == 0);
    for (let i = 0; i < tests.length; i++) {
      const startTime = new Date();
      try {
        this[tests[i]]();
        passes++;
        this.log(true, new Date() - startTime, tests[i]);
      } catch (err) {
        fails++;
        this.log(false, new Date() - startTime, tests[i], err);
      }
    }

    const finalResults = document.createElement('div');
    finalResults.innerHTML = 'Test completed with ' + passes +
        ' tests passed and ' + fails + ' tests failed.';
    this.container.appendChild(finalResults);
  }

  assert(expected, actual) {
    if (expected != actual) {
      const ex = new Error();
      ex.expected = expected;
      ex.actual = actual;
      throw ex;
    }
  }

  testGameDoesNotStartWithLessThan3Players() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    game.start();
    this.assert(0, p1.hand.length);
  }

  testCardsDealtFor3Players() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();
    this.assert(10, p1.hand.length);
    game.endPhase();
    this.assert(16, p2.hand.length);
    game.endPhase();
    this.assert(22, p3.hand.length);
    game.endPhase();
    this.assert(22, p1.hand.length);
  }

  testCardsDealtFor4Players() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    const p4 = game.addPlayer();
    game.start();
    this.assert(9, p1.hand.length);
    game.endPhase();
    this.assert(13, p2.hand.length);
    game.endPhase();
    this.assert(17, p3.hand.length);
    game.endPhase();
    this.assert(17, p4.hand.length);
  }

  testCardsDealtFor5Players() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    const p4 = game.addPlayer();
    const p5 = game.addPlayer();
    game.start();
    this.assert(8, p1.hand.length);
    game.endPhase();
    this.assert(11, p2.hand.length);
    game.endPhase();
    this.assert(14, p3.hand.length);
    game.endPhase();
    this.assert(14, p4.hand.length);
  }

  testSell() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.PRICE),
               new ArtPiece(Artist.KRYPTO, AuctionType.DOUBLE),
               new ArtPiece(Artist.KRYPTO, AuctionType.DOUBLE),
               new ArtPiece(Artist.CHRISTIN_P, AuctionType.PRICE)];
    p2.hand = [];
    p3.hand = [];

    this.assert(true, !!p1.turn);

    this.assert(4, p1.hand.length);

    // Wrong order for double sale
    p1.sell(0, 'Krypto\'s Thing', 'Ew', 1000, 1);
    this.assert(4, p1.hand.length);
    this.assert(false, p1.turn.done);

    // Non matching artists for double sale
    p1.sell(1, 'Krypto\'s Other Thing', 'Eww', 1000, 3);
    this.assert(4, p1.hand.length);
    this.assert(false, p1.turn.done);

    // Second piece cannot also be a double
    p1.sell(1, 'Krypto\'s Other Thing', 'Eww', 1000, 2);
    this.assert(4, p1.hand.length);
    this.assert(false, p1.turn.done);

    // Cannot sell 2 cards when there are already 4 for that artists
    game.soldPieces[0][Artist.KRYPTO] = 4;
    p1.sell(1, 'Krypto\'s Other Thing', 'Eww', 1000, 0);
    this.assert(4, p1.hand.length);
    this.assert(false, p1.turn.done);
    this.assert(0, game.phase);
    this.assert(4, game.soldPieces[0][Artist.KRYPTO]);
    game.soldPieces[0][Artist.KRYPTO] = 0;

    // Used turn does not consume cards
    p1.sell(0, 'Krypto\'s Thing', 'Ew', 1000);
    this.assert(3, p1.hand.length);
    this.assert(true, p1.turn.done);
    p1.sell(2, 'Christin\'s Thing', 'Bleah', 1000);
    this.assert(3, p1.hand.length);
  }

  testPriceAuction() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.PRICE)];
    p2.hand = [];
    p3.hand = [];

    this.assert(true, !!p1.turn);
    this.assert(false, !!p2.bid);
    this.assert(false, !!p3.bid);

    this.assert(1, p1.hand.length);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p1.sell(0, 'Krypto\'s Masterpiece', 'Enough said.', 1000);
    this.assert(0, p1.hand.length);
    this.assert(true, !!p2.bid);
    this.assert(false, !!p3.bid);

    p2.bid.no();
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(true, p2.bid.done);
    this.assert(true, !!p3.bid);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p3.board.length);
    p3.bid.yes();
    this.assert(1, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(101000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(99000, p3.cash);
    this.assert(1, p3.board.length);
  }

  testPriceAuctionInsufficientMoneyAndSellerBuys() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.PRICE)];
    p2.hand = [];
    p3.hand = [];
    p3.cash = 1000;

    this.assert(true, !!p1.turn);
    this.assert(false, !!p2.bid);
    this.assert(false, !!p3.bid);

    this.assert(1, p1.hand.length);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p1.sell(0, 'Krypto\'s Masterpiece', 'Enough said.', 10000);
    this.assert(0, p1.hand.length);
    this.assert(true, !!p2.bid);
    this.assert(false, !!p3.bid);

    p2.bid.no();
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(true, p2.bid.done);
    this.assert(true, !!p3.bid);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(1000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p3.board.length);
    p3.bid.yes();
    this.assert(1, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(90000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(1000, p3.cash);
    this.assert(1, p1.board.length);
    this.assert(0, p3.board.length);
  }

  testBlindAuction() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.BLIND)];
    p2.hand = [];
    p3.hand = [];

    this.assert(1, p1.hand.length);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p1.sell(0, 'Krypto\'s New Masterpiece', 'Oops.');
    this.assert(0, p1.hand.length);
    this.assert(true, !!p1.bid);
    this.assert(true, !!p2.bid);
    this.assert(true, !!p3.bid);

    p1.bid.bid(90000);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p2.bid.bid(110000);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p3.bid.bid(100000);
    this.assert(1, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(200000, p1.cash);
    this.assert(0, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(1, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testBlindAuctionSellerWins() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.BLIND)];
    p2.hand = [];
    p3.hand = [];

    this.assert(1, p1.hand.length);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p1.sell(0, 'Krypto\'s New Masterpiece', 'Oops.');
    this.assert(0, p1.hand.length);
    this.assert(true, !!p1.bid);
    this.assert(true, !!p2.bid);
    this.assert(true, !!p3.bid);

    p1.bid.bid(100000);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p2.bid.bid(110000);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p3.bid.bid(100000);
    this.assert(1, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(0, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(1, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testSinglePassAuction() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [];
    p2.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.ONCE)];
    p3.hand = [];

    // Advance to p2's turn.
    game.endTurn();

    this.assert(1, p2.hand.length);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p2.sell(0, 'Krypto\'s Newest Masterpiece', 'Sorry.');
    this.assert(0, p2.hand.length);
    this.assert(false, !!p1.bid);
    this.assert(false, !!p2.bid);
    this.assert(true, !!p3.bid);

    p3.bid.bid(1000);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(true, !!p1.bid);
    this.assert(false, !!p2.bid);

    p1.bid.bid(120000);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(true, !!p2.bid);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p2.bid.pass();
    this.assert(1, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(0, p1.cash);
    this.assert(200000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(1, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testSinglePassAuctionAllPass() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [];
    p2.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.ONCE)];
    p3.hand = [];

    // Advance to p2's turn.
    game.endTurn();

    this.assert(1, p2.hand.length);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p2.sell(0, 'Krypto\'s Newest Masterpiece', 'Sorry.');
    this.assert(0, p2.hand.length);
    this.assert(false, !!p1.bid);
    this.assert(false, !!p2.bid);
    this.assert(true, !!p3.bid);

    p3.bid.pass();
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(true, !!p1.bid);
    this.assert(false, !!p2.bid);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p1.bid.pass();
    this.assert(1, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(false, !!p2.bid);
    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(1, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testSinglePassAuctionSellerWins() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [];
    p2.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.ONCE)];
    p3.hand = [];

    // Advance to p2's turn.
    game.endTurn();

    this.assert(1, p2.hand.length);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p2.sell(0, 'Krypto\'s Newest Masterpiece', 'Sorry.');
    this.assert(0, p2.hand.length);
    this.assert(false, !!p1.bid);
    this.assert(false, !!p2.bid);
    this.assert(true, !!p3.bid);

    p3.bid.pass();
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(true, !!p1.bid);
    this.assert(false, !!p2.bid);

    p1.bid.bid(90000);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(true, !!p2.bid);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p2.bid.bid(91000);
    this.assert(1, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(100000, p1.cash);
    this.assert(9000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(1, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testOpenAuctionAllPass() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [];
    p2.hand = [];
    p3.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.OPEN)];

    // Advance to p3's turn.
    game.endTurn();
    game.endTurn();

    this.assert(1, p3.hand.length);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p3.sell(0, 'Krypto\'s Final Masterpiece', 'Last one, promise.', 1000);
    this.assert(0, p3.hand.length);
    this.assert(true, !!p1.bid);
    this.assert(true, !!p2.bid);
    this.assert(true, !!p3.bid);

    p2.bid.pass();
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p3.bid.pass();
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p1.bid.pass();
    this.assert(1, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(99000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(1, p3.board.length);
  }

  testOpenAuction() {
    const self = this;
    const verifyAuctioneerState = function(
        p1Pending, p2Pending, p3Pending, bid, bidder, pieces) {
      self.assert(p1Pending, p3.bid.auctioneer.pending[0]);
      self.assert(p2Pending, p3.bid.auctioneer.pending[1]);
      self.assert(p3Pending, p3.bid.auctioneer.pending[2]);
      self.assert(bid, p3.bid.auctioneer.currentBid);
      self.assert(bidder, p3.bid.auctioneer.currentBidder);
      self.assert(bid, p1.bid.currentBid);
      self.assert(bidder, p1.bid.currentBidder);
      self.assert(bid, p2.bid.currentBid);
      self.assert(bidder, p2.bid.currentBidder);
      self.assert(bid, p3.bid.currentBid);
      self.assert(bidder, p3.bid.currentBidder);
      self.assert(pieces, game.soldPieces[0][Artist.KRYPTO]);
    }

    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [];
    p2.hand = [];
    p3.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.OPEN)];

    // Advance to p3's turn.
    game.endTurn();
    game.endTurn();

    this.assert(1, p3.hand.length);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p3.sell(0, 'Krypto\'s Final Masterpiece', 'Last one, promise.', 1000);
    this.assert(0, p3.hand.length);
    this.assert(true, !!p1.bid);
    this.assert(true, !!p2.bid);
    this.assert(true, !!p3.bid);

    verifyAuctioneerState(true, true, true, 1000, 2, 0);

    p2.bid.pass();
    verifyAuctioneerState(true, false, true, 1000, 2, 0);

    p2.bid.bid(2000);
    verifyAuctioneerState(true, false, true, 2000, 1, 0);

    p2.bid.bid(3000);
    verifyAuctioneerState(true, false, true, 2000, 1, 0);

    p1.bid.bid(4000);
    verifyAuctioneerState(false, true, true, 4000, 0, 0);

    p3.bid.bid(3500);
    verifyAuctioneerState(false, true, true, 4000, 0, 0);

    p1.bid.pass();
    verifyAuctioneerState(false, true, true, 4000, 0, 0);

    p2.bid.bid(4000);
    verifyAuctioneerState(false, true, true, 4000, 0, 0);

    p2.bid.bid(5000);
    verifyAuctioneerState(true, false, true, 5000, 1, 0);

    p1.bid.pass();
    verifyAuctioneerState(false, false, true, 5000, 1, 0);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p3.bid.pass();
    verifyAuctioneerState(false, false, false, 5000, 1, 1);
    this.assert(100000, p1.cash);
    this.assert(95000, p2.cash);
    this.assert(105000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(1, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testDoubleAuctionOneCardEndOfPhase() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.DOUBLE)];
    p2.hand = [];
    p3.hand = [];

    game.soldPieces[0][Artist.KRYPTO] = 4;

    this.assert(0, game.phase);
    this.assert(0, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(100000, p1.cash);
    p1.sell(0, 'Krypto\'s Extra Piece', 'There were too many');
    this.assert(1, game.phase);
    this.assert(30000, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(100000, p1.cash);
  }

  testDoubleAuctionTwoCardsEndOfPhase() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.DOUBLE),
               new ArtPiece(Artist.KRYPTO, AuctionType.PRICE)];
    p2.hand = [];
    p3.hand = [];

    game.soldPieces[0][Artist.KRYPTO] = 3;

    this.assert(0, game.phase);
    this.assert(0, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(100000, p1.cash);
    p1.sell(0, 'Krypto\'s Extra Piece', 'There were too many', undefined /* price */, 1);
    this.assert(1, game.phase);
    this.assert(30000, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(100000, p1.cash);
  }

  testDoubleAuctionOneCardOneToEndPhase() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.DOUBLE)];
    p2.hand = [];
    p3.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.PRICE)];

    game.soldPieces[0][Artist.KRYPTO] = 3;

    this.assert(0, game.phase);
    this.assert(0, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(100000, p1.cash);
    p1.sell(0, 'Krypto\'s Extra Piece', 'There were too many');
    this.assert(0, game.phase);
    this.assert(0, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(100000, p1.cash);
    this.assert(true, p2.turn instanceof SpecialTurn);

    p2.turn.pass();
    p3.sell(0, 'Krypto\'s Pricey Piece', 'It is expensive', 10000);
    this.assert(1, game.phase);
    this.assert(30000, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);

    this.assert(0, game.currentPlayer);
    this.assert(false, p1.turn.done);
    this.assert(true, p2.turn.done);
    this.assert(true, p3.turn.done);
  }

  testDoubleAuctionOneCardOneMoreToEndPhaseButNoTakers() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.DOUBLE)];
    p2.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.PRICE)];
    p3.hand = [];

    game.soldPieces[0][Artist.KRYPTO] = 3;

    this.assert(0, game.phase);
    this.assert(0, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(100000, p1.cash);
    p1.sell(0, 'Krypto\'s Extra Piece', 'There were too many');
    this.assert(0, game.phase);
    this.assert(0, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(100000, p1.cash);
    this.assert(true, p2.turn instanceof SpecialTurn);

    p2.turn.pass();
    this.assert(0, p1.board.length);
    p3.turn.pass();
    this.assert(0, game.phase);
    this.assert(0, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(100000, p1.cash);
    this.assert(1, p1.board.length);
    this.assert(4, game.soldPieces[0][Artist.KRYPTO]);

    this.assert(1, game.currentPlayer);
    this.assert(true, p1.turn.done);
    this.assert(false, p2.turn.done);
    this.assert(true, p3.turn.done);
    this.assert(false, p2.turn instanceof SpecialTurn);
  }

  testDoubleAuctionTwoCards() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [
        new ArtPiece(Artist.KRYPTO, AuctionType.DOUBLE),
        new ArtPiece(Artist.KRYPTO, AuctionType.PRICE)
    ];
    p2.hand = [];
    p3.hand = [];

    this.assert(100000, p1.cash);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p1.sell(0, 'Krypto\'s Extra Piece', 'There were too many', 10000, 1);
    this.assert(100000, p1.cash);

    this.assert(100000, p2.cash);
    p2.bid.yes();
    this.assert(2, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(110000, p1.cash);
    this.assert(90000, p2.cash);
    this.assert(2, p2.board.length);

    this.assert(1, game.currentPlayer);
    this.assert(true, p1.turn.done);
    this.assert(false, p2.turn.done);
    this.assert(null, p3.turn);
    this.assert(false, p2.turn instanceof SpecialTurn);
  }

  testDoubleAuctionOneCard() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.DOUBLE)];
    p2.hand = [];
    p3.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.PRICE)];

    this.assert(100000, p1.cash);
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    p1.sell(0, 'Krypto\'s Extra Piece', 'There were too many');
    this.assert(100000, p1.cash);

    this.assert(true, p2.turn instanceof SpecialTurn);
    this.assert(null, p3.turn);
    p2.turn.pass();
    this.assert(true, p2.turn.done);
    this.assert(true, p3.turn instanceof SpecialTurn);

    this.assert(100000, p3.cash);
    p3.sell(0, 'Krypto\'s Expensive Piece', 'Too bad', 25000);
    this.assert(true, !!p1.bid);
    this.assert(false, !!p2.bid);
    this.assert(false, !!p3.bid);

    p1.bid.no();
    this.assert(0, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(true, p1.bid.done);
    this.assert(false, p2.bid.done);
    this.assert(false, !!p3.bid);

    this.assert(100000, p2.cash);
    p2.bid.no();
    this.assert(2, game.soldPieces[0][Artist.KRYPTO]);
    this.assert(2, p3.board.length);
    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(75000, p3.cash);

    this.assert(0, game.currentPlayer);
    this.assert(false, p1.turn.done);
    this.assert(true, p2.turn.done);
    this.assert(true, p3.turn.done);
    this.assert(false, p1.turn instanceof SpecialTurn);
  }

  testEndOfPhase() {
    const game = new ModernArt();
    const p1 = game.addPlayer();
    const p2 = game.addPlayer();
    const p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.YOKO, AuctionType.PRICE)];
    p2.hand = [];
    p3.hand = [];

    p1.board = [
        new ArtPiece(Artist.LITE_METAL, undefined /* type unimportant in this test */),   // 20k
        new ArtPiece(Artist.YOKO),                                                        // 30k
        new ArtPiece(Artist.CHRISTIN_P), new ArtPiece(Artist.CHRISTIN_P),                 // 20k
        new ArtPiece(Artist.KRYPTO)
    ];
    p2.board = [
        new ArtPiece(Artist.LITE_METAL),                                                  // 20k
        new ArtPiece(Artist.YOKO), new ArtPiece(Artist.YOKO), new ArtPiece(Artist.YOKO),  // 90k
        new ArtPiece(Artist.CHRISTIN_P),                                                  // 10k
        new ArtPiece(Artist.KARL_GITTER),
        new ArtPiece(Artist.KRYPTO)
    ];
    p3.board = [
        new ArtPiece(Artist.LITE_METAL), new ArtPiece(Artist.LITE_METAL),                 // 40k
        new ArtPiece(Artist.CHRISTIN_P),                                                  // 10k
        new ArtPiece(Artist.KRYPTO), new ArtPiece(Artist.KRYPTO)
    ];

    game.soldPieces[0][Artist.LITE_METAL] = 4;   // Should be worth 20k
    game.soldPieces[0][Artist.YOKO] = 4;         // Should be worth 30k
    game.soldPieces[0][Artist.CHRISTIN_P] = 4;   // Should be worth 10k
    game.soldPieces[0][Artist.KARL_GITTER] = 1;
    game.soldPieces[0][Artist.KRYPTO] = 4;

    this.assert(0, game.phase);
    this.assert(0, game.valueBoard[Artist.LITE_METAL][0]);
    this.assert(0, game.valueBoard[Artist.YOKO][0]);
    this.assert(0, game.valueBoard[Artist.CHRISTIN_P][0]);
    this.assert(0, game.valueBoard[Artist.KARL_GITTER][0]);
    this.assert(0, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    p1.sell(0, 'Yoko\'s Extra Piece', 'There were too many');
    this.assert(1, game.phase);
    this.assert(20000, game.valueBoard[Artist.LITE_METAL][0]);
    this.assert(30000, game.valueBoard[Artist.YOKO][0]);
    this.assert(10000, game.valueBoard[Artist.CHRISTIN_P][0]);
    this.assert(0, game.valueBoard[Artist.KARL_GITTER][0]);
    this.assert(0, game.valueBoard[Artist.KRYPTO][0]);
    this.assert(170000, p1.cash);
    this.assert(220000, p2.cash);
    this.assert(150000, p3.cash);
  }
}