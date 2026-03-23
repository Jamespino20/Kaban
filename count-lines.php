<?php

/**
 * Advanced codebase analyzer:
 * - Lines (total + non-empty)
 * - Token estimates per file
 * - JSON output for AI tooling
 */

$rootPath = __DIR__;
$allowedExtensions = ['php', 'js', 'css', 'html', 'ts', 'tsx'];
$excludeDirs = ['vendor', 'node_modules', '.git'];

$filesData = [];
$totals = [
    'files' => 0,
    'lines' => 0,
    'non_empty_lines' => 0,
    'min_tokens' => 0,
    'avg_tokens' => 0,
    'max_tokens' => 0,
];

$iterator = new RecursiveIteratorIterator(
    new RecursiveCallbackFilterIterator(
        new RecursiveDirectoryIterator($rootPath, FilesystemIterator::SKIP_DOTS),
        function ($file) use ($excludeDirs) {
            if ($file->isDir()) {
                return !in_array($file->getFilename(), $excludeDirs);
            }
            return true;
        }
    )
);

foreach ($iterator as $file) {
    if (!$file->isFile()) {
        continue;
    }

    $extension = strtolower($file->getExtension());
    if (!in_array($extension, $allowedExtensions)) {
        continue;
    }

    $path = $file->getPathname();
    $relativePath = str_replace($rootPath . DIRECTORY_SEPARATOR, '', $path);

    $lines = file($path, FILE_IGNORE_NEW_LINES);
    if ($lines === false) {
        continue;
    }

    $totalLines = count($lines);
    $nonEmptyLines = count(array_filter($lines, fn($l) => trim($l) !== ''));

    // Token estimation heuristics
    $minTokens = $totalLines * 8;
    $avgTokens = $totalLines * 12;
    $maxTokens = $totalLines * 15;

    $filesData[] = [
        'file' => $relativePath,
        'extension' => $extension,
        'lines' => $totalLines,
        'non_empty_lines' => $nonEmptyLines,
        'estimated_tokens' => [
            'min' => $minTokens,
            'avg' => $avgTokens,
            'max' => $maxTokens
        ]
    ];

    $totals['files']++;
    $totals['lines'] += $totalLines;
    $totals['non_empty_lines'] += $nonEmptyLines;
    $totals['min_tokens'] += $minTokens;
    $totals['avg_tokens'] += $avgTokens;
    $totals['max_tokens'] += $maxTokens;
}

// Sort files by average token cost (descending)
usort(
    $filesData,
    fn($a, $b) =>
    $b['estimated_tokens']['avg'] <=> $a['estimated_tokens']['avg']
);

// Output
echo "Files scanned: {$totals['files']}\n";
echo "Total lines: {$totals['lines']}\n";
echo "Non-empty lines: {$totals['non_empty_lines']}\n\n";

echo "Estimated tokens (project):\n";
echo "  Minimum: {$totals['min_tokens']}\n";
echo "  Average: {$totals['avg_tokens']}\n";
echo "  Maximum: {$totals['max_tokens']}\n\n";

// Write JSON report
file_put_contents(
    'codebase-analysis.json',
    json_encode([
        'summary' => $totals,
        'files' => $filesData
    ], JSON_PRETTY_PRINT)
);

echo "Detailed report written to codebase-analysis.json\n";
