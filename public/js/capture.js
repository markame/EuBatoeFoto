// capture.js

const photoLimit = 3; // Limite máximo de fotos que podem ser tiradas
let photosTaken = 0; // Contador pro número de fotos tiradas
let timer; // Variável para o temporizador de fotos

// Função para tirar foto
function takeSnapshot(video) {
    const canvas = document.querySelector('canvas');
    canvas.height = video.videoHeight; // Definindo altura do canvas com base na altura do vídeo
    canvas.width = video.videoWidth; // Definindo largura do canvas com base na largura do vídeo

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height); // Desenhar o vídeo no canvas com as dimensões especificadas

    // Convertendo a imagem do canvas para URL de dados
    const imageData = canvas.toDataURL('image/jpeg');

    // Criando um novo elemento de imagem para pré-visualização
    const img = document.createElement('img');
    img.src = imageData;
    img.classList.add('photo', 'fade-in'); //Adiciona a classe photo e fade-in as fotos que forem colocadas no preview para adicionar animação
    img.style.width = '400px'; // ajusta o tamanho da pré-visualização conforme necessário
    img.style.height = '220px';
    document.getElementById('preview').appendChild(img);

    //Tira a classe fade in depois de um tempo setado
    setTimeout(() => {
        img.classList.remove('fade-in');
    }, 100);

    photosTaken++;

    // Verifica se chegou ao limite de fotos e para o timer
    if (photosTaken === photoLimit) {
        clearInterval(timer);
    }
}

export function initCapture() {
    const video = document.querySelector('video');

    // Função para capturar uma foto e adicioná-la ao preview
    document.getElementById('takeSnapshotIcon').addEventListener('click', () => {
        if (photosTaken < photoLimit) {
            timer = setInterval(() => takeSnapshot(video), 3000)
        } else {
            alert('Máximo de 3 fotos atingido.');
        }
    });
}
