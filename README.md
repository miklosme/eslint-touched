# eslint-touched

A wrapper around ESLint to remove results that were not originated in the current git branch. This lets new rules be incrementally adopted, and keep ESLint errors blocking continuous delivery.

It uses `git diff` to find which lines are currently changed.

## Usage

`node src/lint.js`

It doesn't have a CLI or published to NPM because I recommend adding it to your CI/CD directly, and customize it however your project needs it.

## License

MIT
