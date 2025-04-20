// Utility functions
function showError(message) {
    alert(message);
}

// Convert image data to blocks
function imageToBlocks(imageData, width, height) {
    const blocks = [];
    for (let y = 0; y < height; y += 8) {
        for (let x = 0; x < width; x += 8) {
            const block = new Array(8).fill(0).map(() => new Array(8).fill(0));
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (x + j < width && y + i < height) {
                        const idx = ((y + i) * width + (x + j)) * 4;
                        block[i][j] = imageData[idx];
                    }
                }
            }
            blocks.push(block);
        }
    }
    return blocks;
}

// Convert blocks back to image data
function blocksToImage(blocks, width, height) {
    const imageData = new Uint8ClampedArray(width * height * 4);
    let blockIdx = 0;
    
    for (let y = 0; y < height; y += 8) {
        for (let x = 0; x < width; x += 8) {
            const block = blocks[blockIdx++];
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (x + j < width && y + i < height) {
                        const idx = ((y + i) * width + (x + j)) * 4;
                        const value = Math.round(block[i][j]);
                        imageData[idx] = value;
                        imageData[idx + 1] = value;
                        imageData[idx + 2] = value;
                        imageData[idx + 3] = 255;
                    }
                }
            }
        }
    }
    return imageData;
} 