Input = {
    keys: {
        "ctrl": 0,
        "m": 0,
        "menu": 0,
    },

    init: function() {
        document.addEventListener('keydown', function(e) { Input.changeKey(e, 1)});
        document.addEventListener('keyup',   function(e) { Input.changeKey(e, 0) });
        document.addEventListener("mousemove", function(e) { Input.setMousePos(e.movementX, e.movementY)});
    },

    setMousePos: function(x, y) {
        Input.mouseX = x;
        Input.mouseY = y;
    },

    changeKey: function(e, to) {
        let key = e.key
        if (e.ctrlKey && e.key === "m") {
            e.preventDefault();

            Input.keys["menu"] = to;
            console.log("Menu", Input.keys["menu"])
        }
        switch (key) {
            // p
            case "m": this.keys.m = to; break;
            // shift
            case "Control": this.keys.ctrl = to; break;
        }
    }
}