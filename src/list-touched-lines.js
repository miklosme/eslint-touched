const execute = require('child-process-promise').exec;

const cmdGetDiffBranch = (target = 'src/') => `
    git diff origin/master... -U0 --minimal --diff-filter=MA ${target}
`;

const cmdGetDiffActual = (target = 'src/') => `
    git diff -U0 ${target}
`;

function isFileLine(line) {
    return /^\+\+\+.*\.(js|jsx)$/.test(line);
}

function getFilePath(line) {
    const match = line.match(/src.*\.(js|jsx)$/);
    if (match && match.length) {
        return match[0];
    }
    throw new Error('something went wrong with regexp of `getFilePath`');
}

function isHunkIdentifierLine(line) {
    return /^@@/.test(line);
}

// this is a hunk: @@ -5 +5,2 @@
function getHunkIdentifierValues(line) {
    const match = /^@@\s-(\d+|\d+,\d+)\s\+(\d+|\d+,\d+)\s@@/.exec(line);
    return match[2];
}

function resolveHunkIdentifier(identifier) {
    const [start, hunkLength] = identifier.split(',').map(x => parseInt(x, 10));

    if (!hunkLength) {
        return [start];
    }

    return Array.from({ length: hunkLength }).map((_, index) => start + index);
}

function flatten(a, b) {
    return a.concat(b);
}

function getTouchedLines(leftData) {
    const endIndex = leftData.findIndex(isFileLine);
    return leftData
        .slice(0, endIndex)
        .filter(isHunkIdentifierLine)
        .map(getHunkIdentifierValues)
        .map(resolveHunkIdentifier)
        .reduce(flatten);
}

function parse(data) {
    console.log('WATCH', 'data', data)
    return data
        .split('\n')
        .reduce((normalised, line, index, allData) => {
            if (isFileLine(line)) {
                return [
                    ...normalised,
                    {
                        file: getFilePath(line),
                        lines: getTouchedLines(allData.slice(index + 1)),
                    },
                ];
            }

            return normalised;
        }, []);
}

function mergeResults(a, b) {
    const normalised = a
        .concat(b)
        .reduce((results, item) => {
            const { file, lines } = item;
            return Object.assign({}, results, {
                [file]: [...(results[file] || []), ...lines],
            });
        }, {});

    return Object.keys(normalised).map(file => ({ file, lines: normalised[file] }));
}

function listTouchedLines(src) {
    return Promise.all([
        execute(cmdGetDiffBranch(src)),
        execute(cmdGetDiffActual(src)),
    ])
        .then(results => results.map(result => parse(result.stdout)))
        .then(results => results.reduce(mergeResults, []));
}

module.exports = listTouchedLines;
