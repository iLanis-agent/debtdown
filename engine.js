/* DebtDown engine - pure functions for debt payoff simulation. */
(function (root) {
  'use strict';
  var MAX_MONTHS = 600;

  // debts: [{name, balance, apr, min}]
  // order: 'avalanche' (highest APR first) or 'snowball' (lowest balance first)
  // Simulates monthly: accrue interest, pay minimums, spread extra to the target.
  function simulate(debts, extraMonthly, order) {
    var ds = debts.map(function (d) {
      return { name: d.name, balance: Number(d.balance) || 0, apr: Number(d.apr) || 0, min: Number(d.min) || 0 };
    }).filter(function (d) { return d.balance > 0; });
    if (!ds.length) return { months: 0, totalInterest: 0, order: [], never: false };

    var rank = ds.slice().sort(function (a, b) {
      return order === 'avalanche' ? b.apr - a.apr : a.balance - b.balance;
    });
    var payoffOrder = [];
    var months = 0, interest = 0;

    while (months < MAX_MONTHS) {
      var alive = ds.filter(function (d) { return d.balance > 0.005; });
      if (!alive.length) break;
      months++;
      // interest accrues
      alive.forEach(function (d) {
        var i = d.balance * (d.apr / 1200);
        d.balance += i;
        interest += i;
      });
      // minimum payments
      var paid = 0;
      alive.forEach(function (d) {
        var pay = Math.min(d.min, d.balance);
        d.balance -= pay;
        paid += pay;
        if (d.balance <= 0.005 && payoffOrder.indexOf(d.name) === -1) payoffOrder.push(d.name);
      });
      // extra to the first unpaid debt in strategy order
      var extra = Number(extraMonthly) || 0;
      for (var k = 0; k < rank.length && extra > 0; k++) {
        var d = rank[k];
        if (d.balance > 0.005) {
          var pay2 = Math.min(extra, d.balance);
          d.balance -= pay2;
          extra -= pay2;
          if (d.balance <= 0.005 && payoffOrder.indexOf(d.name) === -1) payoffOrder.push(d.name);
        }
      }
      // stuck: minimums don't cover interest and no extra
      var anyProgress = ds.some(function (d, i2) { return true; });
      if (!paid && !extra) break;
      var growing = alive.every(function (d) { return d.min <= d.balance * (d.apr / 1200); });
      if (growing && !(Number(extraMonthly) > 0)) {
        return { months: MAX_MONTHS, totalInterest: Math.round(interest), order: payoffOrder, never: true };
      }
    }
    return { months: months, totalInterest: Math.round(interest), order: payoffOrder, never: months >= MAX_MONTHS };
  }

  function compare(debts, extraMonthly) {
    var av = simulate(debts, extraMonthly, 'avalanche');
    var sn = simulate(debts, extraMonthly, 'snowball');
    return {
      avalanche: av,
      snowball: sn,
      interestSaved: Math.max(0, sn.totalInterest - av.totalInterest),
      monthsSaved: Math.max(0, sn.months - av.months)
    };
  }

  var api = { simulate: simulate, compare: compare };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DebtDown = api;
})(typeof window !== 'undefined' ? window : this);
