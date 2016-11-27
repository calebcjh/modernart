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

  testCardsDealt() {
    var game = new ModernArt();
    var p1 = game.addPlayer();
    var p2 = game.addPlayer();
    var p3 = game.addPlayer();
    this.assert(0, p1.hand.length);
    game.start();
    this.assert(10, p1.hand.length);
  }
}