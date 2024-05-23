const video = document.querySelector('video');
const photoLimit = 3; // Limite máximo de fotos que podem ser tiradas
let photosTaken = 0; // Contador pro número de fotos tiradas
let currentStream = null; // Variável para armazenar o stream de vídeo atual

const VIDEO_WIDTH = 840; // Largura do vídeo (tela grande principal)
const VIDEO_HEIGHT = 490; // Altura do video

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
        img.style.width = '100px'; // ajusta o tamanho da pré-visualização conforme necessário
        img.style.height = 'auto';
        document.getElementById('preview').appendChild(img);

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

    const margin = 10; // Margem nas laterais
    const pageWidth = 148; // Largura da página A5 em mm
    const pageHeight = 210; // Altura da página A5 em mm
    const availableWidth = pageWidth - 2 * margin; // Largura disponível para as imagens
    const maxImageHeight = 50; // Altura máxima da imagem
    const spacing = 5; // Espaçamento entre as imagens

    let yOffset = 10; // Posição Y inicial com uma margem superior

    const logoSrc = 'http://localhost/images/rodape.png';
    const logo = new Image();
    logo.src = logoSrc;
    logo.onload = () => {
        const logoWidth = availableWidth; // Largura disponível em mm
        const logoHeight = logo.height * logoWidth / logo.width; // Mantem proporção

        // Verifica se todas as imagens e o rodapé cabem na mesma página
        const totalHeight = (images.length * maxImageHeight) + ((images.length - 1) * spacing) + logoHeight;
        if (totalHeight > pageHeight - yOffset) {
            doc.addPage();
            yOffset = 10;
        }

        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const imgWidth = availableWidth;
            const imgHeight = Math.min(img.naturalHeight * imgWidth / img.naturalWidth, maxImageHeight); // Manter proporção e limitar altura

            // Corta a imagem proporcionalmente se for necessário
            const cropX = 0;
            const cropY = (img.naturalHeight - (img.naturalWidth * maxImageHeight / imgWidth)) / 2;
            const cropWidth = img.naturalWidth;
            const cropHeight = img.naturalWidth * maxImageHeight / imgWidth;

            const xOffset = (pageWidth - imgWidth) / 2; // Centraliza a imagem horizontalmente

            doc.addImage(img.src, 'JPEG', xOffset, yOffset, imgWidth, imgHeight, undefined, undefined, 0, cropX, cropY, cropWidth, cropHeight);
            yOffset += imgHeight + spacing; // Adiciona margem entre as imagens
        }

        const xOffset = (pageWidth - logoWidth) / 2; // Centraliza o rodapé horizontalmente
        doc.addImage(logo, 'PNG', xOffset, yOffset, logoWidth, logoHeight, '', 'FAST'); // Adiciona rodapé com melhor qualidade (necessario porque anteriormente o rodapé estava com qualidade ruim)

        doc.save('fotos.pdf'); // nome padrão do pdf
    };
});