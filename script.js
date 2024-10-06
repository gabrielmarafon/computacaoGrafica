const canvas = document.getElementById('viewport');
const ctx = canvas.getContext('2d');
const listElement = document.getElementById('list');

const displayList = [];

function drawViewport() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    displayList.forEach(obj => {
        if (obj.type === 'ponto') {
            drawPoint(obj);
        } else if (obj.type === 'reta') {
            drawLine(obj);
        } else if (obj.type === 'polilinha') {
            drawPolyline(obj);
        } else if (obj.type === 'poligono') {
            drawPolygon(obj);
        }
    });

    updateObjectList();
}

function drawPoint(point) {
    ctx.fillStyle = point.color || 'white';
    ctx.beginPath();
    ctx.arc(point.x, canvas.height - point.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawLine(line) {
    ctx.strokeStyle = line.color || 'white';
    ctx.beginPath();
    ctx.moveTo(line.x1, canvas.height - line.y1);
    ctx.lineTo(line.x2, canvas.height - line.y2);
    ctx.stroke();
    ctx.closePath();
}

function drawPolyline(polyline) {
    ctx.strokeStyle = polyline.color || 'white';
    ctx.beginPath();
    ctx.moveTo(polyline.points[0].x, canvas.height - polyline.points[0].y);
    for (let i = 1; i < polyline.points.length; i++) {
        ctx.lineTo(polyline.points[i].x, canvas.height - polyline.points[i].y);
    }
    ctx.stroke();
    ctx.closePath();
}

function drawPolygon(polygon) {
    if (polygon.points.length < 3) return;

    ctx.strokeStyle = polygon.color || 'white';
    ctx.beginPath();

    let firstPoint = transformToViewport(polygon.points[0].x, polygon.points[0].y);
    ctx.moveTo(firstPoint.x, viewportHeight - firstPoint.y);

    for (let i = 1; i < polygon.points.length; i++) {
        let point = transformToViewport(polygon.points[i].x, polygon.points[i].y);
        ctx.lineTo(point.x, viewportHeight - point.y);
    }

    ctx.lineTo(firstPoint.x, viewportHeight - firstPoint.y);
    ctx.stroke();
    ctx.closePath();
}

function addObject() {
    const name = document.getElementById('objectName').value;
    const type = document.getElementById('objectType').value;
    const x = parseInt(document.getElementById('coordX').value);
    const y = parseInt(document.getElementById('coordY').value);
    const color = document.getElementById('lineColor').value;

    if (type === 'ponto') {
        displayList.push({ name, type, x, y, color });
    } else if (type === 'reta') {
        const x2 = parseInt(prompt("Informe a coordenada X2 da reta:"));
        const y2 = parseInt(prompt("Informe a coordenada Y2 da reta:"));
        displayList.push({ name, type, x1: x, y1: y, x2, y2, color });
    } else if (type === 'poligono') {
        let points = [];
        let numberOfPoints = parseInt(prompt("Quantos pontos terá o polígono? (mínimo 3)"));
        if (numberOfPoints < 3) {
            alert("Polígonos precisam ter pelo menos 3 pontos!");
            return;
        }

        for (let i = 0; i < numberOfPoints; i++) {
            let px = parseInt(prompt(`Coordenada X do ponto ${i + 1}`));
            let py = parseInt(prompt(`Coordenada Y do ponto ${i + 1}`));
            points.push({ x: px, y: py });
        }

        displayList.push({ name, type, points, color });
    }

    drawViewport();
}

function editObject() {
    const name = document.getElementById('editName').value;
    const newX = parseInt(document.getElementById('newCoordX').value);
    const newY = parseInt(document.getElementById('newCoordY').value);

    const obj = displayList.find(obj => obj.name === name);
    if (obj) {
        if (obj.type === 'ponto') {
            obj.x = newX;
            obj.y = newY;
        } else if (obj.type === 'reta') {
            const newX2 = parseInt(prompt("Informe a nova coordenada X2 da reta:"));
            const newY2 = parseInt(prompt("Informe a nova coordenada Y2 da reta:"));
            obj.x1 = newX;
            obj.y1 = newY;
            obj.x2 = newX2;
            obj.y2 = newY2;
        } else if (obj.type === 'polilinha' || obj.type === 'poligono') {
            const points = [];
            let editMore = true;
            let index = 0;

            while (editMore && index < obj.points.length) {
                const newXPoint = parseInt(prompt(`Informe a nova coordenada X para o ponto ${index + 1}:`));
                const newYPoint = parseInt(prompt(`Informe a nova coordenada Y para o ponto ${index + 1}:`));
                points.push({ x: newXPoint, y: newYPoint });
                index++;
                editMore = confirm(`Editar mais pontos? (Atual: ${index})`);
            }

            obj.points = points;
        }
        // Atualiza o viewport após edição
        drawViewport();
    } else {
        alert('Objeto não encontrado!');
    }
}

function updateObjectList() {
    listElement.innerHTML = '';

    displayList.forEach((obj, index) => {
        const li = document.createElement('li');
        li.className = 'object-item';

        if (obj.type === 'ponto') {
            li.textContent = `${obj.name} (${obj.type}) - X: ${obj.x}, Y: ${obj.y}`;
        } else if (obj.type === 'reta') {
            li.textContent = `${obj.name} (${obj.type}) - X1: ${obj.x1}, Y1: ${obj.y1}, X2: ${obj.x2}, Y2: ${obj.y2}`;
        } else if (obj.type === 'polilinha') {
            li.textContent = `${obj.name} (${obj.type}) - Pontos: ${obj.points.length}`;
        } else if (obj.type === 'poligono') {
            li.textContent = `${obj.name} (${obj.type}) - Pontos: ${obj.points.length}`;
        }

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remover';
        removeButton.onclick = () => removeObjectByIndex(index);

        li.appendChild(removeButton);
        listElement.appendChild(li);
    });
}

function removeObjectByIndex(index) {
    displayList.splice(index, 1);
    drawViewport();
}

let windowX = 0; // Posição X da window
let windowY = 0; // Posição Y da window
let windowWidth = 500; // Largura inicial da window
let windowHeight = 500; // Altura inicial da window

const viewportWidth = canvas.width;
const viewportHeight = canvas.height;

function transformToViewport(x, y) {
    const transformedX = ((x - windowX) / windowWidth) * viewportWidth;
    const transformedY = ((y - windowY) / windowHeight) * viewportHeight;
    return { x: transformedX, y: transformedY };
}

function drawPoint(point) {
    const { x, y } = transformToViewport(point.x, point.y);
    ctx.fillStyle = point.color || 'white';
    ctx.beginPath();
    ctx.arc(x, viewportHeight - y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawLine(line) {
    const start = transformToViewport(line.x1, line.y1);
    const end = transformToViewport(line.x2, line.y2);
    ctx.strokeStyle = line.color || 'white';
    ctx.beginPath();
    ctx.moveTo(start.x, viewportHeight - start.y);
    ctx.lineTo(end.x, viewportHeight - end.y);
    ctx.stroke();
    ctx.closePath();
}

function panLeft() {
    windowX -= 10; // Move a window 10 unidades à esquerda
    drawViewport();
}

function panRight() {
    windowX += 10; // Move a window 10 unidades à direita
    drawViewport();
}

function panUp() {
    windowY -= 10; // Move a window 10 unidades para cima
    drawViewport();
}

function panDown() {
    windowY += 10; // Move a window 10 unidades para baixo
    drawViewport();
}

function zoomIn() {
    windowWidth /= 1.1; // Reduz o tamanho da window para aproximar (zoom in)
    windowHeight /= 1.1;
    drawViewport();
}

function zoomOut() {
    windowWidth *= 1.1; // Aumenta o tamanho da window para afastar (zoom out)
    windowHeight *= 1.1;
    drawViewport();
}

function translateObject() {
    const objectName = prompt("Digite o nome do objeto a ser transladado:");
    const dx = parseFloat(prompt("Digite o valor da translação em X:"));
    const dy = parseFloat(prompt("Digite o valor da translação em Y:"));

    const obj = displayList.find(item => item.name === objectName);

    if (obj) {
        if (obj.type === 'ponto') {
            obj.x += dx;
            obj.y += dy;
        } else if (obj.type === 'reta') {
            obj.x1 += dx;
            obj.y1 += dy;
            obj.x2 += dx;
            obj.y2 += dy;
        } else if (obj.type === 'polilinha' || obj.type === 'poligono') {
            obj.points.forEach(point => {
                point.x += dx;
                point.y += dy;
            });
        }
        drawViewport();
    } else {
        alert("Objeto não encontrado.");
    }
}

function rotateObject() {
    const objectName = prompt("Digite o nome do objeto a ser rotacionado:");
    const angle = parseFloat(prompt("Digite o ângulo de rotação em graus:")) * (Math.PI / 180); // Convertendo para radianos
    const cx = parseFloat(prompt("Digite a coordenada X do ponto de rotação:"));
    const cy = parseFloat(prompt("Digite a coordenada Y do ponto de rotação:"));

    const obj = displayList.find(item => item.name === objectName);

    if (obj) {
        const rotatePoint = (x, y) => ({
            x: cx + (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle),
            y: cy + (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle)
        });

        if (obj.type === 'ponto') {
            const newPoint = rotatePoint(obj.x, obj.y);
            obj.x = newPoint.x;
            obj.y = newPoint.y;
        } else if (obj.type === 'reta') {
            const newPoint1 = rotatePoint(obj.x1, obj.y1);
            const newPoint2 = rotatePoint(obj.x2, obj.y2);
            obj.x1 = newPoint1.x;
            obj.y1 = newPoint1.y;
            obj.x2 = newPoint2.x;
            obj.y2 = newPoint2.y;
        } else if (obj.type === 'polilinha' || obj.type === 'poligono') {
            obj.points = obj.points.map(point => rotatePoint(point.x, point.y));
        }
        drawViewport();
    } else {
        alert("Objeto não encontrado.");
    }
}

function scaleObject() {
    const objectName = prompt("Digite o nome do objeto a ser escalonado:");
    const scaleX = parseFloat(prompt("Digite o fator de escala em X:"));
    const scaleY = parseFloat(prompt("Digite o fator de escala em Y:"));
    const cx = parseFloat(prompt("Digite a coordenada X do ponto de referência:"));
    const cy = parseFloat(prompt("Digite a coordenada Y do ponto de referência:"));

    const obj = displayList.find(item => item.name === objectName);

    if (obj) {
        const scalePoint = (x, y) => ({
            x: cx + (x - cx) * scaleX,
            y: cy + (y - cy) * scaleY
        });

        if (obj.type === 'ponto') {
            const newPoint = scalePoint(obj.x, obj.y);
            obj.x = newPoint.x;
            obj.y = newPoint.y;
        } else if (obj.type === 'reta') {
            const newPoint1 = scalePoint(obj.x1, obj.y1);
            const newPoint2 = scalePoint(obj.x2, obj.y2);
            obj.x1 = newPoint1.x;
            obj.y1 = newPoint1.y;
            obj.x2 = newPoint2.x;
            obj.y2 = newPoint2.y;
        } else if (obj.type === 'polilinha' || obj.type === 'poligono') {
            obj.points = obj.points.map(point => scalePoint(point.x, point.y));
        }
        drawViewport();
    } else {
        alert("Objeto não encontrado.");
    }
}

// Função para selecionar objetos da display list
function selectObject(name) {
    displayList.forEach(obj => {
        obj.selected = (obj.name === name);
    });
}

// Interface de usuário para aplicar as transformações
function applyTransformations() {
    const dx = parseFloat(prompt("Informe o valor de translação em X:"));
    const dy = parseFloat(prompt("Informe o valor de translação em Y:"));
    const angle = parseFloat(prompt("Informe o ângulo de rotação:"));
    const scaleFactor = parseFloat(prompt("Informe o fator de escala:"));

    translateObject(dx, dy);
    rotateObject(angle);
    scaleObject(scaleFactor);
}