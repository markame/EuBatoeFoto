const cursor = document.querySelector(".custom-cursor");
const iconContainer = document.getElementById("icon-container"); // Captura o elemento que contém as imagens
const icons = document.querySelectorAll("#icon-container img"); // Captura todas as imagens dentro do elemento
let isCursorInited = false;

const initCursor = () => {
    cursor.classList.add("custom-cursor--init");
    isCursorInited = true;
};

const destroyCursor = () => {
    cursor.classList.remove("custom-cursor--init");
    isCursorInited = false;
};

icons.forEach((icon) => {
    icon.addEventListener("mouseover", () => {
        cursor.classList.add("custom-cursor--img-hover"); // Adiciona classe de estilo quando o cursor está sobre a imagem
    });

    icon.addEventListener("mouseout", () => {
        cursor.classList.remove("custom-cursor--img-hover"); // Remove classe de estilo quando o cursor sai da imagem
    });

    icon.addEventListener("mouseenter", () => {
        cursor.classList.add("custom-cursor--near-icons"); // Adiciona classe de estilo quando o cursor entra na imagem
    });

    icon.addEventListener("mouseleave", () => {
        cursor.classList.remove("custom-cursor--near-icons"); // Remove classe de estilo quando o cursor sai da imagem
    });
});

document.addEventListener("mousemove", (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (!isCursorInited) {
        initCursor();
    }

    cursor.style = `translate: ${mouseX}px ${mouseY}px`; //Faz o dot acompanhar o mouse real
});

document.addEventListener("mouseout", destroyCursor);
