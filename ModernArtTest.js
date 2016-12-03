class ModernArtTest {
  constructor(element) {
    this.container = element;
  }

  log(pass, time, test, error) {
    var resultElement = document.createElement('div');
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
    var passes = 0;
    var fails = 0;
    var tests = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
        .filter(x => x.indexOf('test') == 0);
    for (var i = 0; i < tests.length; i++) {
      var startTime = new Date();
      try {
        this[tests[i]]();
        passes++;
        this.log(true, new Date() - startTime, tests[i]);
      } catch (err) {
        fails++;
        this.log(false, new Date() - startTime, tests[i], err);
      }
    }

    var finalResults = document.createElement('div');
    finalResults.innerHTML = 'Test completed with ' + passes +
        ' tests passed and ' + fails + ' tests failed.';
    this.container.appendChild(finalResults);
  }

  assert(expected, actual) {
    if (expected != actual) {
      var ex = new Error();
      ex.expected = expected;
      ex.actual = actual;
      throw ex;
    }
  }

  testGameDoesNotStartWithLessThan3Players() {
    var game = new ModernArt();
    var p1 = game.addPlayer();
    game.start();
    this.assert(0, p1.hand.length);
  }

  testCardsDealtFor3Players() {
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
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
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
    var p4 = game.addPlayer();
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
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
    var p4 = game.addPlayer();
    var p5 = game.addPlayer();
    game.start();
    this.assert(8, p1.hand.length);
    game.endPhase();
    this.assert(11, p2.hand.length);
    game.endPhase();
    this.assert(14, p3.hand.length);
    game.endPhase();
    this.assert(14, p4.hand.length);
  }

  testPriceAuction() {
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.PRICE)];
    p2.hand = [];
    p3.hand = [];

    this.assert(true, !!p1.turn);
    this.assert(false, !!p2.bid);
    this.assert(false, !!p3.bid);

    this.assert(1, p1.hand.length);
    p1.sell(0, 'Krypto\'s Masterpiece', 'Enough said.', 1000);
    this.assert(0, p1.hand.length);
    this.assert(true, !!p2.bid);
    this.assert(false, !!p3.bid);

    p2.bid.no();
    this.assert(true, p2.bid.done);
    this.assert(true, !!p3.bid);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p3.board.length);
    p3.bid.yes();
    this.assert(101000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(99000, p3.cash);
    this.assert(1, p3.board.length);
  }

  testPriceAuctionInsufficientMoneyAndSellerBuys() {
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
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
    p1.sell(0, 'Krypto\'s Masterpiece', 'Enough said.', 10000);
    this.assert(0, p1.hand.length);
    this.assert(true, !!p2.bid);
    this.assert(false, !!p3.bid);

    p2.bid.no();
    this.assert(true, p2.bid.done);
    this.assert(true, !!p3.bid);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(1000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p3.board.length);
    p3.bid.yes();
    this.assert(90000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(1000, p3.cash);
    this.assert(1, p1.board.length);
    this.assert(0, p3.board.length);
  }

  testBlindAuction() {
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.BLIND)];
    p2.hand = [];
    p3.hand = [];

    this.assert(1, p1.hand.length);
    p1.sell(0, 'Krypto\'s New Masterpiece', 'Oops.');
    this.assert(0, p1.hand.length);
    this.assert(true, !!p1.bid);
    this.assert(true, !!p2.bid);
    this.assert(true, !!p3.bid);

    p1.bid.bid(90000);
    p2.bid.bid(110000);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p3.bid.bid(100000);
    this.assert(200000, p1.cash);
    this.assert(0, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(1, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testBlindAuctionSellerWins() {
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.BLIND)];
    p2.hand = [];
    p3.hand = [];

    this.assert(1, p1.hand.length);
    p1.sell(0, 'Krypto\'s New Masterpiece', 'Oops.');
    this.assert(0, p1.hand.length);
    this.assert(true, !!p1.bid);
    this.assert(true, !!p2.bid);
    this.assert(true, !!p3.bid);

    p1.bid.bid(100000);
    p2.bid.bid(110000);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p3.bid.bid(100000);
    this.assert(0, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(1, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testSinglePassAuction() {
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [];
    p2.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.ONCE)];
    p3.hand = [];

    // Advance to p2's turn.
    game.endTurn();

    this.assert(1, p2.hand.length);
    p2.sell(0, 'Krypto\'s Newest Masterpiece', 'Sorry.');
    this.assert(0, p2.hand.length);
    this.assert(false, !!p1.bid);
    this.assert(false, !!p2.bid);
    this.assert(true, !!p3.bid);

    p3.bid.bid(1000);
    this.assert(true, !!p1.bid);
    this.assert(false, !!p2.bid);

    p1.bid.bid(120000);
    this.assert(true, !!p2.bid);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p2.bid.pass();
    this.assert(0, p1.cash);
    this.assert(200000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(1, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testSinglePassAuctionAllPass() {
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [];
    p2.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.ONCE)];
    p3.hand = [];

    // Advance to p2's turn.
    game.endTurn();

    this.assert(1, p2.hand.length);
    p2.sell(0, 'Krypto\'s Newest Masterpiece', 'Sorry.');
    this.assert(0, p2.hand.length);
    this.assert(false, !!p1.bid);
    this.assert(false, !!p2.bid);
    this.assert(true, !!p3.bid);

    p3.bid.pass();
    this.assert(true, !!p1.bid);
    this.assert(false, !!p2.bid);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p1.bid.pass();
    this.assert(false, !!p2.bid);
    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(1, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testSinglePassAuctionSellerWins() {
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [];
    p2.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.ONCE)];
    p3.hand = [];

    // Advance to p2's turn.
    game.endTurn();

    this.assert(1, p2.hand.length);
    p2.sell(0, 'Krypto\'s Newest Masterpiece', 'Sorry.');
    this.assert(0, p2.hand.length);
    this.assert(false, !!p1.bid);
    this.assert(false, !!p2.bid);
    this.assert(true, !!p3.bid);

    p3.bid.pass();
    this.assert(true, !!p1.bid);
    this.assert(false, !!p2.bid);

    p1.bid.bid(90000);
    this.assert(true, !!p2.bid);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p2.bid.bid(91000);
    this.assert(100000, p1.cash);
    this.assert(9000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(1, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testOpenAuctionAllPass() {
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [];
    p2.hand = [];
    p3.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.OPEN)];

    // Advance to p3's turn.
    game.endTurn();
    game.endTurn();

    this.assert(1, p3.hand.length);
    p3.sell(0, 'Krypto\'s Final Masterpiece', 'Last one, promise.', 1000);
    this.assert(0, p3.hand.length);
    this.assert(true, !!p1.bid);
    this.assert(true, !!p2.bid);
    this.assert(true, !!p3.bid);

    p2.bid.pass();
    p3.bid.pass();

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p1.bid.pass();
    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(99000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(1, p3.board.length);
  }

  testOpenAuction() {
    var self = this;
    var verifyAuctioneerState = function(
        p1Pending, p2Pending, p3Pending, bid, bidder) {
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
    }

    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
    game.start();

    // Clear hands for easier handling
    p1.hand = [];
    p2.hand = [];
    p3.hand = [new ArtPiece(Artist.KRYPTO, AuctionType.OPEN)];

    // Advance to p3's turn.
    game.endTurn();
    game.endTurn();

    this.assert(1, p3.hand.length);
    p3.sell(0, 'Krypto\'s Final Masterpiece', 'Last one, promise.', 1000);
    this.assert(0, p3.hand.length);
    this.assert(true, !!p1.bid);
    this.assert(true, !!p2.bid);
    this.assert(true, !!p3.bid);

    verifyAuctioneerState(true, true, true, 1000, 2);

    p2.bid.pass();
    verifyAuctioneerState(true, false, true, 1000, 2);

    p2.bid.bid(2000);
    verifyAuctioneerState(true, false, true, 2000, 1);

    p2.bid.bid(3000);
    verifyAuctioneerState(true, false, true, 2000, 1);

    p1.bid.bid(4000);
    verifyAuctioneerState(false, true, true, 4000, 0);

    p3.bid.bid(3500);
    verifyAuctioneerState(false, true, true, 4000, 0);

    p1.bid.pass();
    verifyAuctioneerState(false, true, true, 4000, 0);

    p2.bid.bid(4000);
    verifyAuctioneerState(false, true, true, 4000, 0);

    p2.bid.bid(5000);
    verifyAuctioneerState(true, false, true, 5000, 1);

    p1.bid.pass();
    verifyAuctioneerState(false, false, true, 5000, 1);

    this.assert(100000, p1.cash);
    this.assert(100000, p2.cash);
    this.assert(100000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(0, p2.board.length);
    this.assert(0, p3.board.length);
    p3.bid.pass();
    verifyAuctioneerState(false, false, false, 5000, 1);
    this.assert(100000, p1.cash);
    this.assert(95000, p2.cash);
    this.assert(105000, p3.cash);
    this.assert(0, p1.board.length);
    this.assert(1, p2.board.length);
    this.assert(0, p3.board.length);
  }

  testEndOfPhase() {
    throw new Error('Not implemented yet');
  }
}