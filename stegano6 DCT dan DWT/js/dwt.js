// DWT Transform functions
function dwt2D(block) {
    const n = block.length;
    const result = new Array(n).fill(0).map(() => new Array(n).fill(0));
    
    // Transform rows
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n/2; j++) {
            result[i][j] = (block[i][2*j] + block[i][2*j+1]) / 2;
            result[i][j+n/2] = (block[i][2*j] - block[i][2*j+1]) / 2;
        }
    }
    
    // Transform columns
    const temp = new Array(n).fill(0).map(() => new Array(n).fill(0));
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n/2; i++) {
            temp[i][j] = (result[2*i][j] + result[2*i+1][j]) / 2;
            temp[i+n/2][j] = (result[2*i][j] - result[2*i+1][j]) / 2;
        }
    }
    
    return temp;
}

function idwt2D(block) {
    const n = block.length;
    const result = new Array(n).fill(0).map(() => new Array(n).fill(0));
    
    // Inverse transform columns
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n/2; i++) {
            result[2*i][j] = block[i][j] + block[i+n/2][j];
            result[2*i+1][j] = block[i][j] - block[i+n/2][j];
        }
    }
    
    // Inverse transform rows
    const temp = new Array(n).fill(0).map(() => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n/2; j++) {
            temp[i][2*j] = result[i][j] + result[i][j+n/2];
            temp[i][2*j+1] = result[i][j] - result[i][j+n/2];
        }
    }
    
    return temp;
}

// Hide message in image using DWT
function hideMessageInImageDWT(canvas, ctx, img, message) {
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const blocks = imageToBlocks(imageData.data, img.width, img.height);
    
    // Convert message to binary
    const messageBinary = message.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
    
    // Add message length at the beginning (32 bits)
    const messageLength = messageBinary.length.toString(2).padStart(32, '0');
    const fullBinary = messageLength + messageBinary;
    
    if (fullBinary.length > blocks.length) {
        showError('Pesan terlalu panjang untuk gambar ini!');
        return;
    }
    
    // Hide message
    let binaryIndex = 0;
    for (let i = 0; i < blocks.length; i++) {
        if (binaryIndex < fullBinary.length) {
            const dwtBlock = dwt2D(blocks[i]);
            const bit = parseInt(fullBinary[binaryIndex]);
            
            // Modify DWT coefficients
            if (bit === 1) {
                dwtBlock[4][4] = Math.abs(dwtBlock[4][4]) + 1;
            } else {
                dwtBlock[4][4] = Math.abs(dwtBlock[4][4]) - 1;
            }
            
            blocks[i] = idwt2D(dwtBlock);
            binaryIndex++;
        }
    }
    
    // Convert back to image
    const newImageData = new ImageData(
        blocksToImage(blocks, img.width, img.height),
        img.width,
        img.height
    );
    
    ctx.putImageData(newImageData, 0, 0);
    
    // Show result container and download link
    document.querySelector('.result-container').style.display = 'block';
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.style.display = 'inline-block';
    downloadLink.href = canvas.toDataURL('image/png');
}

// Extract message from image using DWT
function extractMessageFromImageDWT(canvas, ctx, img) {
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const blocks = imageToBlocks(imageData.data, img.width, img.height);
    
    // Extract message length
    let messageLengthBinary = '';
    for (let i = 0; i < 32; i++) {
        if (i >= blocks.length) {
            throw new Error('Gambar tidak mengandung pesan steganografi yang valid');
        }
        const dwtBlock = dwt2D(blocks[i]);
        messageLengthBinary += dwtBlock[4][4] > 0 ? '1' : '0';
    }
    
    const messageLength = parseInt(messageLengthBinary, 2);
    if (isNaN(messageLength) || messageLength <= 0 || messageLength > 10000) {
        throw new Error('Panjang pesan tidak valid');
    }
    
    // Extract message
    let messageBinary = '';
    for (let i = 32; i < 32 + messageLength; i++) {
        if (i >= blocks.length) {
            throw new Error('Gambar tidak mengandung pesan steganografi yang valid');
        }
        const dwtBlock = dwt2D(blocks[i]);
        messageBinary += dwtBlock[4][4] > 0 ? '1' : '0';
    }
    
    // Convert binary to text
    let message = '';
    for (let i = 0; i < messageBinary.length; i += 8) {
        if (i + 8 > messageBinary.length) break;
        const byte = messageBinary.substr(i, 8);
        const charCode = parseInt(byte, 2);
        if (charCode >= 32 && charCode <= 126) {
            message += String.fromCharCode(charCode);
        }
    }
    
    if (message.length === 0) {
        throw new Error('Tidak dapat mengekstrak pesan yang valid');
    }
    
    return message;
} 