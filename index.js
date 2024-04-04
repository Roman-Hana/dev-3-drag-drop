const dropContainer = document.querySelector('.container');

dropContainer.ondragover = (e) => e.preventDefault();

const selectedEl = [];

const inputContent = () => {
    const elements = document.getElementById('input').value.split('');

    const accumulator = document.querySelector('.textFromInput');
    accumulator.innerHTML = '';

    let leftPosition = 15;

    elements.forEach((element, index) => {
        const newElement = document.createElement('div');
        newElement.classList.add('draggable');
        newElement.style.position = 'absolute';
        newElement.draggable = true;
        newElement.textContent = element;
        newElement.id = index;
        newElement.style.left = `${leftPosition}px`;
        newElement.ondragstart = drag;
        accumulator.appendChild(newElement);

        const rect = newElement.getBoundingClientRect();
        newElement.dataset.prevX = newElement.offsetLeft;
        newElement.dataset.prevY = newElement.offsetTop;

        leftPosition += rect.width;

        newElement.addEventListener('click', (e) => {
            if (e.ctrlKey) {
                newElement.classList.toggle('selected');
                if (newElement.classList.contains('selected')) {
                    selectedEl.push(newElement);
                } else {
                    const index = selectedEl.indexOf(newElement);
                    if (index > -1) {
                        selectedEl.splice(index, 1);
                    }
                }
            }
        });
    });
};

function drag(e) {
    e.dataTransfer.setData('id', e.target.id);
}

dropContainer.ondrop = drop;

function drop(e) {

    e.preventDefault();
    let elId = e.dataTransfer.getData('id');
    const el = document.getElementById(elId);
    if (el) {
        if (el.classList.contains('selected')) {
            const dx = e.clientX - parseFloat(el.dataset.prevX);
            const dy = e.clientY - parseFloat(el.dataset.prevY);

            selectedEl.forEach((el) => {
                el.style.position = 'absolute';
                el.style.left = `${el.offsetLeft + dx}px`;
                el.style.top = `${el.offsetTop + dy}px`;

                el.dataset.prevX = el.offsetLeft;
                el.dataset.prevY = el.offsetTop;
            });
        } else {
            const x = e.clientX;
            const y = e.clientY;

            const elUnderCursor = document.elementFromPoint(x, y);
            if (elUnderCursor && elUnderCursor !== el && elUnderCursor.classList.contains('draggable')) {

                const tempX = parseFloat(el.dataset.prevX);
                const tempY = parseFloat(el.dataset.prevY);
                el.dataset.prevX = parseFloat(elUnderCursor.dataset.prevX);
                el.dataset.prevY = parseFloat(elUnderCursor.dataset.prevY);
                elUnderCursor.dataset.prevX = tempX;
                elUnderCursor.dataset.prevY = tempY;

                elUnderCursor.style.left = `${elUnderCursor.dataset.prevX}px`;
                elUnderCursor.style.top = `${elUnderCursor.dataset.prevY}px`;
            }

            el.style.position = 'absolute';
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;

            el.dataset.prevX = x;
            el.dataset.prevY = y;
        }
    }
}

document.querySelector('.action').addEventListener('click', () => {
    inputContent();
});

let selectionActive = false;
let selectionBox = null;

dropContainer.onmousedown = (e) => {
    if (e.target !== dropContainer) return;
    selectionActive = true;
    selectionBox = document.createElement('div');
    selectionBox.style.border = '1px dashed #000';
    selectionBox.style.position = 'absolute';
    selectionBox.style.left = `${e.clientX}px`;
    selectionBox.style.top = `${e.clientY}px`;
    dropContainer.appendChild(selectionBox);
};

dropContainer.onmousemove = (e) => {
    if (!selectionActive) return;
    selectionBox.style.width = `${e.clientX - parseFloat(selectionBox.style.left)}px`;
    selectionBox.style.height = `${e.clientY - parseFloat(selectionBox.style.top)}px`;
};

dropContainer.onmouseup = () => {
    if (!selectionActive) return;
    selectionActive = false;
    const rect = selectionBox.getBoundingClientRect();
    dropContainer.removeChild(selectionBox);
    selectionBox = null;

    document.querySelectorAll('.draggable').forEach((el) => {
        const elRect = el.getBoundingClientRect();
        if (elRect.left >= rect.left && elRect.right <= rect.right && elRect.top >= rect.top && elRect.bottom <= rect.bottom) {
            el.classList.add('selected');
            if (!selectedEl.includes(el)) {
                selectedEl.push(el);
            }
        } else {
            el.classList.remove('selected');
            const index = selectedEl.indexOf(el);
            if (index > -1) {
                selectedEl.splice(index, 1);
            }
        }
    });
};