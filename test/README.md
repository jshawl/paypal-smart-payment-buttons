# Testing

Functional tests are located in the `client/` directory and are run by karma
with `npm run karma`.

Unit tests are co-located next to their implementation in `../src/` and are run
by vitest with `npm run vitest`.

Ex: `src/card/lib` contains both the implementation and unit tests for utility functions used by smart-payment-buttons.