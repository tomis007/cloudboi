//http://stackoverflow.com/questions/7812514/drawing-a-dot-on-html5-canvas
$(document).ready(function () {
    FastClick.attach(document.body);
    $('body').bind('touchmove', function(e){e.preventDefault()})
    var elem = document.getElementById("menu");
    alertify.parent(elem);
    var name1 = "Links_Awakening.gb";
    var name2 = "Kirbys_Dreamland.gb";
    var selectedRom = name1;

    //size the controls to fill page
    var new_height = $(window).height() - 288;
    new_height = (new_height > 250) ? 250 : new_height;
    $('#controls').css('height', new_height.toString());
    $('#controls').css('display', 'inline-block');

    //websocket stuff
    var ws = new WebSocket("ws://" + location.host + "/CloudBoi/stream");
    ws.binaryType = 'arraybuffer';
    ws.onopen = function() {
        console.log("Starting the game");
    };
    
    // called when a message received from server
    ws.onmessage = function (evt) {
        updateCanvas(evt.data);
    };
    
    // called when socket connection closed
    ws.onclose = function() {
        console.log("bye brah");
    };
    
    // called in case of an error
    ws.onerror = function(err) {
        console.log("ERROR!", err );
    };
    
    //for keyboard controls
    $(document).keydown(function(e) {
        var press = translateDown(e.which)
        if (press != "invalid press") {
            ws.send(press);
        }
    });
    $(document).keyup(function(e) {
        var press = translateUp(e.which)
        if (press != "invalid press") {
            ws.send(press);
        }        
    });

    //touch controls
    $("#menu").on('mousedown touchstart', function(e) {
        pauseGame();
        showMenu();
    });


    //translate touch/keyboard events into controls
    $("#left").on('mousedown touchstart', function(e) {
        ws.send("1");
    });
    $("#left").on('mouseup touchend', function(e) {
        ws.send("9");
    });
    
    $("#right").on('mousedown touchstart', function(e) {
        ws.send("0");
    });
    $("#right").on('mouseup touchend', function(e) {
        ws.send("8");
    });

    $("#up").on('mousedown touchstart', function(e) {
        ws.send("2");
    });
    $("#up").on('mouseup touchend', function(e) {
        ws.send("10");
    });
 
    $("#down").on('mousedown touchstart', function(e) {
        ws.send("3");
    });
    $("#down").on('mouseup touchend', function(e) {
        ws.send("11");
    });    

    $("#select").on('mousedown touchstart', function(e) {
        ws.send("6");
    });
    $("#select").on('mouseup touchend', function(e) {
        ws.send("14");
    }); 

    $("#start").on('mousedown touchstart', function(e) {
        ws.send("7");
    });
    $("#start").on('mouseup touchend', function(e) {
        ws.send("15");
    });

    $("#jpA").on('mousedown touchstart', function(e) {
        ws.send("4");
    });
    $("#jpA").on('mouseup touchend', function(e) {
        ws.send("12");
    });     

    $("#jpB").on('mousedown touchstart', function(e) {
        ws.send("5");
    });
    $("#jpB").on('mouseup touchend', function(e) {
        ws.send("13");
    });  


    function translateUp(key) {
        switch (key) {
            case 65: return "9";
            case 83: return "11";
            case 68: return "8";
            case 87: return "10";
            case 80: return "15";
            case 76: return "14";
            case 78: return "12";
            case 77: return "13";
            default: return "invalid press";
        }
    }

    function showMenu() {
        bootbox.dialog({
            title: "GameBoi Menu",
            message: "Select Option",
            buttons: {
                resume: {
                    label: "Resume",
                    className: "btn-primary",
                    callback: function() { resumeGame(); }
                },
                save: {
                   label: "Save",
                   className: "btn-success",
                   callback: function() { saveGame(); }
                },
                load: {
                    label: "Load",
                    callback: function() {loadGame();}
                },
                quit: {
                  label: "Quit",
                  className: "btn-danger",
                  callback: function() { quitGame(); }
               }
           },
           onEscape: function () { resumeGame(); }
        });        
    }



    function pauseGame() {
        console.log("pausing");
        ws.send("16");
    }

    function resumeGame() {
        console.log("resuming");
        ws.send("17");
    }

    function saveGame() {
        bootbox.dialog({
            title: "Select Slot",
            message: '<div class="form-group"> ' +
                     '<div class="col-md-4"> <div class="radio"> <label for="slot1"> ' +
                     '<input type="radio" name="slot" id="slot1" value="slot1">slot1</label> ' +
                    '</div>' +
                    '<div class="radio"> <label for="slot2"> ' +
                    '<input type="radio" name="slot" id="slot2" value="slot2">slot2</label> ' +
                    '</div> ' +
                    '</div> </div>',
            buttons: {
                    success: {
                        label: "Save",
                        className: "btn-success",
                        callback: function () {
                            var answer = $("input[name='slot']:checked").val()
                            console.log("You've chosen: " + answer);
                            alertify.delay(2000).success("Saved Game!");
                            resumeGame();
                        }
                    }
                },
            onEscape: function () {
                alertify.delay(2000).error("Failed to save :(");
                resumeGame();
            }
            }
        );
    }

    function loadGame() {
    bootbox.dialog({
                title: "Load ROM",
                message: '<div class="form-group"> ' +
                    '<div class="col-md-4"> <div class="radio"> <label for="' + name1 +  '"> ' +
                    '<input type="radio" name="rom" id="' + name1 + '" value="' + name1 + '"> ' +
                    name1 + '</label> ' +
                    '</div><div class="radio"> <label for="' + name2 + '"> ' +
                    '<input type="radio" name="rom" id="' + name2 + '" value="' + name2 + '">'+ name2 + '</label> ' +
                    '</div> ' +
                    '</div> </div>',
                buttons: {
                    success: {
                        label: "Load",
                        className: "btn-success",
                        callback: function () {
                            var answer = $("input[name='rom']:checked").val()
                            console.log("You've chosen: " + answer);
                        }
                    }
                }
            }
        );

    }


    function quitGame() {
        bootbox.confirm("Quit without saving?", function(result) {
            if (result == true) {
                alertify.error("Bye!");
            } else {
                showMenu();
            }
        });
    }


    function translateDown(key) {
        switch (key) {
            case 65: return "1";
            case 83: return "3";
            case 68: return "0";
            case 87: return "2";
            case 80: return "7";
            case 76: return "6";
            case 78: return "4";
            case 77: return "5";
            default: return "invalid press";
        }
    }

    //render recieved frame onto screen
    function updateCanvas(gbstream) {
        var dv = new DataView(gbstream);
        var canvas = document.getElementById("gamescreen");
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        var ctx = canvas.getContext("2d");
        var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

        for (var row = 0; row < 144; row++) {
            for (var col = 0; col < 160; col++) {
                var index = (row * 160) + col;
                switch (dv.getInt8(index)) {
                    case 0: drawPixel(canvasData, col, row, 255, 255, 255, 255); break;
                    case 1: drawPixel(canvasData, col, row, 192, 192, 192, 255); break;
                    case 2: drawPixel(canvasData, col, row, 96, 96, 96, 255); break;
                    case 3: drawPixel(canvasData, col, row, 0, 0, 0, 255); break;
                }
            }
        }
        ctx.putImageData(canvasData, 0, 0);
    }

    function drawPixel (canvasData, x, y, r, g, b, a) {
        x *= 2;
        y *= 2;
        var index = (x + (y * 320)) * 4;

        canvasData.data[index + 0] = r;
        canvasData.data[index + 1] = g;
        canvasData.data[index + 2] = b;
        canvasData.data[index + 3] = a;
        index = (x + ((y + 1) * 320)) * 4;
        canvasData.data[index + 0] = r;
        canvasData.data[index + 1] = g;
        canvasData.data[index + 2] = b;
        canvasData.data[index + 3] = a;
        index = (x + 1 + (y * 320)) * 4;
        canvasData.data[index + 0] = r;
        canvasData.data[index + 1] = g;
        canvasData.data[index + 2] = b;
        canvasData.data[index + 3] = a;
        index = (x + 1 + ((y + 1) * 320)) * 4;
        canvasData.data[index + 0] = r;
        canvasData.data[index + 1] = g;
        canvasData.data[index + 2] = b;
        canvasData.data[index + 3] = a;
    }


});
