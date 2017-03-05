function makeDraggable(id) {
    var myElement = document.getElementById(id);
    var me = $('#' + id);
    var sx = 0;
    var sy = 0;
    var mc = new Hammer(myElement);

    mc.on('panstart', function (ev) {
        sx = parseInt(me.css('left'));
        sy = parseInt(me.css('top'));
    });
    mc.on("pan", function (ev) {
        me.css({top: sy + ev.deltaY, left: sx + ev.deltaX})
    });
}

makeDraggable('myElement');
makeDraggable('myElement2');