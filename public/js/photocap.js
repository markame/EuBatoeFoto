const video = document.querySelector('video');
const photoLimit = 3; // Limite máximo de fotos que podem ser tiradas
let photosTaken = 0; // Contador pro número de fotos tiradas
let currentStream = null; // Variável para armazenar o stream de vídeo atual

const VIDEO_WIDTH = 900; // Largura do vídeo (tela grande principal)
const VIDEO_HEIGHT = 600; // Altura do video

// Função pra reconhecer as câmeras disponíveis e colocar elas dentro do select
navigator.mediaDevices.enumerateDevices().then(getCameras).catch(handleError);

function getCameras(devices) {
    const videoSelect = document.getElementById('cameraSelect');
    videoSelect.innerHTML = '';
    devices.forEach(device => {
        if (device.kind === 'videoinput') {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        }
    });
    if (videoSelect.length > 0) {
        switchCamera(videoSelect.value);
    }
}

// Função para alternar entre as câmeras pra caso a webcam externa nao funcione ou a do notebook
function switchCamera(deviceId) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const constraints = {
        video: {
            deviceId: { exact: deviceId },
            width: { exact: VIDEO_WIDTH },
            height: { exact: VIDEO_HEIGHT }
        }
    };
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
            video.play();
        })
        .catch(handleError);
}

function handleError(error) {
    console.error('Error: ', error);
}

// Função para capturar uma foto e adicioná-la ao preview
document.getElementById('takeSnapshotIcon').addEventListener('click', () => {
    if (photosTaken < photoLimit) {
        const canvas = document.querySelector('canvas');
        canvas.height = VIDEO_HEIGHT; // Definindo altura do canvas com base na altura do vídeo
        canvas.width = VIDEO_WIDTH; // Definindo largura do canvas com base na largura do vídeo

        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT); // Desenhar o vídeo no canvas com as dimensões especificadas

        // Convertendo a imagem do canvas para URL de dados
        const imageData = canvas.toDataURL('image/jpeg');

        // Criando um novo elemento de imagem para pré-visualização
        const img = document.createElement('img');
        img.src = imageData;
        img.classList.add('photo', 'fade-in'); //Adiciona a classe photo e fade-in as fotos que forem colocadas no preview para adicionar animação
        img.style.width = '400'; // ajusta o tamanho da pré-visualização conforme necessário
        img.style.height = '220';
        document.getElementById('preview').appendChild(img);

        //Tira a classe fade in depois de um tempo setado
        setTimeout(() => {
            img.classList.remove('fade-in');
        }, 100);

        photosTaken++;
    } else {
        alert('Máximo de 3 fotos atingido.');
    }
});

// Função para alternar a exibição do select de câmeras
document.getElementById('switchCameraIcon').addEventListener('click', () => {
    const cameraSelect = document.getElementById('cameraSelect');
    cameraSelect.style.display = cameraSelect.style.display === 'none' ? 'block' : 'none';
});

// Função para alternar entre câmeras quando o select é alterado
document.getElementById('cameraSelect').addEventListener('change', (event) => {
    switchCamera(event.target.value);
});

// Função para gerar o PDF com as fotos capturadas e o rodapé
document.getElementById('takePrint').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const preview = document.getElementById('preview');
    const images = preview.querySelectorAll('img');
    if (images.length === 0) {
        alert('Nenhuma foto para imprimir.'); // Caso não forem tiradas fotos o alert aparece
        return;
    }

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
    });

    const margin = 5;
    const pageWidth = 148;
    const pageHeight = 210;
    const availableWidth = pageWidth - 2 * margin;
    const maxImageHeight = 50;
    const spacing = 5;

    let yOffset = 5;

    const logoSrc = 'http://localhost/images/rodapeV2.png';
    const logo = new Image();
    logo.src = logoSrc;
    logo.onload = () => {
        const logoWidth = availableWidth / 2;
        const logoHeight = logo.height * logoWidth / logo.width;

        const totalHeight = (maxImageHeight * 3) + (spacing * 2) + logoHeight;
        if (totalHeight > pageHeight - yOffset) {
            doc.addPage();
            yOffset = 10;
        }

        // Adiciona a primeira coluna
        for (let i = 0; i < Math.min(3, images.length); i++) {
            const img = images[i];
            const imgWidth = (pageWidth / 2) - 2 * margin;
            const imgHeight = Math.min(img.naturalHeight * imgWidth / img.naturalWidth, maxImageHeight);

            const cropX = 0;
            const cropY = (img.naturalHeight - (img.naturalWidth * maxImageHeight / imgWidth)) / 2;
            const cropWidth = img.naturalWidth;
            const cropHeight = img.naturalWidth * maxImageHeight / imgWidth;

            let xOffset = ((pageWidth / 2) - imgWidth) / 2;
            doc.addImage(img.src, 'JPEG', xOffset, yOffset, imgWidth, imgHeight, undefined, undefined, 0, cropX, cropY,
                cropWidth, cropHeight);
            yOffset += imgHeight + spacing;
        }

        // Adiciona a segunda coluna (repetindo a primeira)
        yOffset = 5;
        for (let i = 0; i < Math.min(3, images.length); i++) {
            const img = images[i];
            const imgWidth = (pageWidth / 2) - 2 * margin;
            const imgHeight = Math.min(img.naturalHeight * imgWidth / img.naturalWidth, maxImageHeight);

            const cropX = 0;
            const cropY = (img.naturalHeight - (img.naturalWidth * maxImageHeight / imgWidth)) / 2;
            const cropWidth = img.naturalWidth;
            const cropHeight = img.naturalWidth * maxImageHeight / imgWidth;

            let xOffset = ((pageWidth / 2) - imgWidth) / 2 + (pageWidth / 2);
            doc.addImage(img.src, 'JPEG', xOffset, yOffset, imgWidth, imgHeight, undefined, undefined, 0, cropX, cropY,
                cropWidth, cropHeight);
            yOffset += imgHeight + spacing;
        }

        yOffset += (((pageHeight - yOffset) / 2) / 2);

        const xOffset = ((pageWidth / 2) - logoWidth) / 2;
        doc.addImage(logo, 'PNG', xOffset, yOffset, logoWidth, logoHeight, '', 'FAST');
        doc.addImage(logo, 'PNG', xOffset + (pageWidth / 2), yOffset, logoWidth, logoHeight, '', 'FAST');

        doc.autoPrint();

        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const iframe = document.getElementById('pdfIframe');
        iframe.src = pdfUrl;

        const afterPrintHandler = () => {
            window.removeEventListener('afterprint', afterPrintHandler);
            location.reload();
        };

        window.addEventListener('afterprint', afterPrintHandler);

        iframe.onload = () => {
            iframe.contentWindow.print();
            preview.innerHTML = ''; // Limpa o preview após a impressão
            photosTaken = 0; // Reinicia o contador de fotos tiradas
        };
    };
});


document.getElementById('takePrint').addEventListener('click', () => {
    const photos = document.querySelectorAll('#preview img'); // Seleciona todas as imagens dentro do preview

    // Adiciona a classe para arrastar para baixo
    photos.forEach(photo => {
        photo.classList.add('drag-down');
    });

    // Reinicia o contador de fotos tiradas após a impressão
    const afterPrintHandler = () => {
        window.removeEventListener('afterprint', afterPrintHandler);
        photosTaken = 0; // Reinicia o contador de fotos tiradas
    };

    window.addEventListener('afterprint', afterPrintHandler);
});

