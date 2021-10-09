let ulTasks = $('#ulTasks');
let btnAdd = $('#btnAdd');
let btnReset = $('#btnReset');
let btnSort = $('#btnSort');
let btnCleanup = $('#btnCleanup');
let inpNewTask = $('#inpNewTask');

ulTasks.attr("contenteditable", "true");

if (localStorage.getItem('page_html')) {
    ulTasks.html(localStorage.getItem('page_html'));
}

function reset() {
    localStorage.clear();
    window.location = window.location;
}

function addItem() {
    let listItem = $('<li>', {
        'class': 'list-group-item bg-dark text-light p-3',
        text: inpNewTask.val(),
        onclick: "itemClick(this)"
    });
    ulTasks.append(listItem)
    localStorage.setItem('page_html', ulTasks.html());
    inpNewTask.val('');
    toggleInputButtons();
}

function itemClick(self) {
    $(self).toggleClass('done text-muted');
    localStorage.setItem('page_html', $('#ulTasks').html());
}

function clearDone() {
    $('#ulTasks .done').remove();
    localStorage.setItem('page_html', $('#ulTasks').html());
    toggleInputButtons();
}

function sortTasks() {
    $('#ulTasks .done').appendTo(ulTasks);
    localStorage.setItem('page_html', $('#ulTasks').html());
}

function toggleInputButtons() {
    btnReset.prop('disabled', inpNewTask.val() == '');
    btnAdd.prop('disabled', inpNewTask.val() == '');
    btnSort.prop('disabled', ulTasks.children().length < 1);
    btnCleanup.prop('disabled', ulTasks.children().length < 1);
}

toggleInputButtons();
inpNewTask.keypress((e) => {
    if (e.which === 13 && inpNewTask.val()) addItem();
})
inpNewTask.on('input', toggleInputButtons);

btnAdd.click(addItem);
btnReset.click(() => {
    inpNewTask.val('');
    toggleInputButtons();
})
btnCleanup.click(clearDone);
btnSort.click(sortTasks);