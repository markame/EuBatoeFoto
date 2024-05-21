<!doctype html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>EuBatoéFoto</title>
    <link href="{{ asset('css/photocap.css') }}" rel="stylesheet">

</head>


<body background="{{ asset('images/BG.png') }}">

<h1>EuBatoéFoto</h1>

<div id="preview-container">
    <div id="preview"></div>
    <video autoplay></video>

    <div id="icon-container">
        <img src="{{ asset('images/switch camera.png') }}" id="switchCameraIcon" alt="Trocar Câmera" class="camera-icon">
        <img src="{{ asset('images/camera.png') }}" id="takeSnapshotIcon" alt="Tirar Foto" class="camera-icon">
        <img src="{{ asset('images/imprimir.png') }}" id="takePrint" alt="Realizar Impressão" class="camera-icon">
    </div>
</div>

<canvas style="display:none;"></canvas>
<select id="cameraSelect" style="display: none;"></select>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="{{ asset('js/photocap.js') }}"></script>

</body>
</html>
