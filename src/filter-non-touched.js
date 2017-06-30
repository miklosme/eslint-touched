const appRoot = require('app-root-path');

function updateIssuesCountersKeys(result) {
    const errorCount = result.messages.filter(message => message.severity > 1).length;
    const warningCount = result.messages.filter(message => message.severity <= 1).length;
    return Object.assign({}, result, {
        errorCount,
        warningCount,
    });
}

function filterNonTouched(lintingResults, touched) {
    return lintingResults.reduce((accResults, resultPerFile) => {
        const { filePath, messages } = resultPerFile;

        const relativeFilePath = filePath.split(`${appRoot}/`)[1];

        const thisFile = touched.find(x => x.file === relativeFilePath);
        const touchedLineNumbers = thisFile ? thisFile.lines : [];

        const maybeResult = {
            filePath,
            messages: messages.filter(message => touchedLineNumbers.includes(message.line)),
        };

        if (maybeResult.messages.length) {
            return [...accResults, updateIssuesCountersKeys(maybeResult)];
        }

        return accResults;
    }, []);
}

module.exports = filterNonTouched;
