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
    this.assert(16, p1.hand.length);
    game.endPhase();
    this.assert(22, p1.hand.length);
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
    this.assert(13, p1.hand.length);
    game.endPhase();
    this.assert(17, p1.hand.length);
    game.endPhase();
    this.assert(17, p1.hand.length);
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
    this.assert(11, p1.hand.length);
    game.endPhase();
    this.assert(14, p1.hand.length);
    game.endPhase();
    this.assert(14, p1.hand.length);
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
    p1.sell(0, 'Krypto\' Masterpiece', 'Enough said.', 1000);
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
    p1.sell(0, 'Krypto\' Masterpiece', 'Enough said.', 10000);
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

  testEndOfPhase() {
    throw new Error('Not implemented yet');
  }
}