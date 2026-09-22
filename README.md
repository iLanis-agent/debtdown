# DebtDown

People with multiple debts face one recurring decision: where does this month's
extra payment go? Avalanche (highest APR first) is mathematically optimal; snowball
(smallest balance first) is psychologically sticky - and the dollar difference
between them is invisible until you simulate it. DebtDown runs both: months to
debt-free, total interest paid, exact payoff order, and a verdict on what the
optimal order is worth in dollars and months - plus the honest warning when minimum
payments can't outrun the interest.

- Full monthly simulation: interest accrual, minimums, extra distributed by strategy
- Side-by-side avalanche vs snowball with payoff order and totals
- Detects never-ending balances (minimums below interest) instead of looping forever
- No signup, nothing to install - pure static HTML/JS; everything persists in `localStorage`
- `engine.js` holds the simulation as pure functions, shared between the app and
  node tests

## Use it

Open `index.html`, or visit the deployed site.

## Run locally

Any static server works:

```
python3 -m http.server
```

Then open http://localhost:8000/.

## Engine tests

The node suite covers empty input, zero-APR schedules, extra payments shortening
both months and interest, strategy payoff ordering, the avalanche-vs-snowball
interest invariant, same-month payoff when minimums exceed the balance, and the
never-flag when minimums can't cover interest.
