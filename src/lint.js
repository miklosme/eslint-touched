const CLIEngine = require('eslint').CLIEngine;
const chalk = require('chalk');
const listTouchedLines = require('./list-touched-lines');
const filterNonTouched = require('./filter-non-touched');

function runLinterOnFiles(linter, formatter, touched) {
    const report = linter.executeOnFiles(touched.map(x => x.file));
    const reportResultsForTouchedLines = filterNonTouched(report.results, touched);
    const noErrorsMessage = chalk.green('Nice! There are no linting errors in your code!');

    if (reportResultsForTouchedLines.length === 0) {
        console.log(noErrorsMessage);
        process.exit(0);
    }

    const formatted = formatter(reportResultsForTouchedLines);

    if (formatted.length === 0) {
        console.log(noErrorsMessage);
        process.exit(0);
    }

    console.log(formatted);
    process.exit(1);
}

listTouchedLines()
    .then(touchedLines => {
        const linter = new CLIEngine();
        const formatter = linter.getFormatter();

        runLinterOnFiles(linter, formatter, touchedLines);
    });
