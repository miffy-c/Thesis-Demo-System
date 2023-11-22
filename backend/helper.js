import * as fs from 'fs';

// Helper function for reading contract ABI
export function helper (file) {
    return (JSON.parse(fs.readFileSync(file)));
}

