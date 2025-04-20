// DCT Transform functions
function dct2D(block) {
    const N = 8;
    const result = new Array(N).fill(0).map(() => new Array(N).fill(0));
    
    for (let u = 0; u < N; u++) {
        for (let v = 0; v < N; v++) {
            let sum = 0;
            for (let x = 0; x < N; x++) {
                for (let y = 0; y < N; y++) {
                    sum += block[x][y] * 
                           Math.cos((2 * x + 1) * u * Math.PI / (2 * N)) * 
                           Math.cos((2 * y + 1) * v * Math.PI / (2 * N));
                }
            }
            result[u][v] = sum * (1/4) * 
                          (u === 0 ? 1/Math.sqrt(2) : 1) * 
                          (v === 0 ? 1/Math.sqrt(2) : 1);
        }
    }
    return result;
}

function idct2D(block) {
    const N = 8;
    const result = new Array(N).fill(0).map(() => new Array(N).fill(0));
    
    for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
            let sum = 0;
            for (let u = 0; u < N; u++) {
                for (let v = 0; v < N; v++) {
                    sum += block[u][v] * 
                           (u === 0 ? 1/Math.sqrt(2) : 1) * 
                           (v === 0 ? 1/Math.sqrt(2) : 1) * 
                           Math.cos((2 * x + 1) * u * Math.PI / (2 * N)) * 
                           Math.cos((2 * y + 1) * v * Math.PI / (2 * N));
                }
            }
            result[x][y] = sum / 4;
        }
    }
    return result;
}

// Hide message in image using DCT
function hideMessageInImageDCT(canvas, ctx, img, message) {
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const blocks = imageToBlocks(imageData.data, img.width, img.height);
    
    // Convert message to binary
    const messageBinary = message.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
    
    // Add message length at the beginning (32 bits)
    const messageLength = messageBinary.length.toString(2).padStart(32, '0');
    const fullBinary = messageLength + messageBinary;
    
    // Check if image can hold the message
    if (fullBinary.length > blocks.length) {
        showError('Pesan terlalu panjang untuk gambar ini!');
        return;
    }
    
    // Hide message in DCT coefficients
    let binaryIndex = 0;
    for (let i = 0; i < blocks.length; i++) {
        if (binaryIndex < fullBinary.length) {
            const dctBlock = dct2D(blocks[i]);
            // Modify mid-frequency coefficients
            const bit = parseInt(fullBinary[binaryIndex]);
            if (bit === 1) {
                dctBlock[4][4] = Math.abs(dctBlock[4][4]) + 10;
            } else {
                dctBlock[4][4] = Math.abs(dctBlock[4][4]) - 10;
            }
            blocks[i] = idct2D(dctBlock);
            binaryIndex++;
        }
    }
    
    // Convert blocks back to image data
    const newImageData = new ImageData(
        blocksToImage(blocks, img.width, img.height),
        img.width,
        img.height
    );
    
    // Put modified image data back to canvas
    ctx.putImageData(newImageData, 0, 0);
    
    // Show result container and download link
    document.querySelector('.result-container').style.display = 'block';
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.style.display = 'inline-block';
    downloadLink.href = canvas.toDataURL('image/png');
}

// Extract message from image using DCT
function extractMessageFromImageDCT(canvas, ctx, img) {
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const blocks = imageToBlocks(imageData.data, img.width, img.height);
    
    // Extract message length (first 32 bits)
    let messageLengthBinary = '';
    for (let i = 0; i < 32; i++) {
        const dctBlock = dct2D(blocks[i]);
        messageLengthBinary += dctBlock[4][4] > 0 ? '1' : '0';
    }
    const messageLength = parseInt(messageLengthBinary, 2);
    
    // Extract message
    let messageBinary = '';
    for (let i = 32; i < 32 + messageLength; i++) {
        const dctBlock = dct2D(blocks[i]);
        messageBinary += dctBlock[4][4] > 0 ? '1' : '0';
    }
    
    // Convert binary to text
    let message = '';
    for (let i = 0; i < messageBinary.length; i += 8) {
        const byte = messageBinary.substr(i, 8);
        message += String.fromCharCode(parseInt(byte, 2));
    }
    
    return message;
} 