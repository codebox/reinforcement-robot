$(() => {
    "use strict";

    const $grid = $('#grid');

    function buildGrid(rows, columns) {
        function buildGridCell(){
            return '<div class="gridCell"></div>';
        }
        function buildGridRow(){
            return `<div class="gridRow">${Array(columns).fill(buildGridCell()).join('')}</div>`;
        }
        return Array(rows).fill(buildGridRow()).join('');
    }
    $grid.append(buildGrid(10, 10));
});