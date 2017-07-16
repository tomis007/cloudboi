//http://stackoverflow.com/questions/7812514/drawing-a-dot-on-html5-canvas
$(document).ready(function () {
    FastClick.attach(document.body);
    $('body').bind('touchmove', function(e){e.preventDefault()})
    var roms = [];
    var saves = [];
    var users = [];
    var slots = 5;
    var current_user = "";
    updateCloudBoiInfo();
    var elem = document.getElementById("menu");
    alertify.parent(elem);

    //size the controls to fill page
    var new_height = $(window).height() - 288;
    new_height = (new_height > 250) ? 250 : new_height;
    $('#controls').css('height', new_height.toString());
    $('#controls').css('display', 'inline-block');

    //websocket stuff
    var ws = new WebSocket("ws://" + location.host + "/CloudBoi/stream");
    ws.binaryType = 'arraybuffer';

    //start the game
    ws.onopen = function() {
        showInitialMenu();
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

    function updateCloudBoiInfo() {
        $.post('/CloudBoi/API', {info:"roms"}).done(function (data){
            roms = data.info;
        });
        $.post('/CloudBoi/API', {info:"saves"}).done(function (data){
            saves = data.info;
        });
        $.post('/CloudBoi/API', {info:"users"}).done(function (data){
            users = data.info;
        });
        $.post('/CloudBoi/API', {info:"slots"}).done(function (data) {
            console.log(data.info[0]);
            slots = data.info[0];
        })
    }

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



       function getUserMenu() {
           console.log("getUserMenu");
           bootbox.dialog({
               title: "Select User",
               message: getHTMLList(users),
               buttons: {
                       success: {
                           label: "Continue",
                           className: "btn-success",
                           callback: function () {
                               var user = $("input[name='item']:checked").val()
                               console.log("You've chosen: " + user);
                               setUser(user);
                               current_user = user;
                               showInitialMenu();
                           }
                       }
                   },
               onEscape: function () {getUserMenu(); }
               }
           );
       }

    function showInitialMenu() {
        updateCloudBoiInfo();
        bootbox.dialog({
            title: "Load Game",
            message: "Select User First, then Select a Rom or a Save",
            buttons: {
                user: {
                    label: "Set User",
                    className: "btn-primary",
                    callback: function() {
                        getUserMenu();
                    }
                },
                loadR: {
                    label: "LoadRom",
                    className: "btn-primary",
                    callback: function() {
                        if (current_user === "") {
                            showInitialMenu();
                        } else {
                            loadRom();
                        }
                    }
                },
                loadS: {
                    label: "LoadSave",
                    className: "btn-primary",
                    callback: function() {
                        if (current_user === "") {
                            showInitialMenu();
                        } else {
                            loadSave();
                        }
                    }
                },
            },
            onEscape: function () { showInitialMenu(); }
        });
    }

    function showMenu() {
        updateCloudBoiInfo();
        bootbox.dialog({
            title: "CloudBoi Menu",
            message: "Select Option",
            buttons: {
                resume: {
                    label: "Resume",
                    //className: "btn-primary",
                    callback: function() { resumeGame(); }
                },
                save: {
                   label: "Save",
                   className: "btn-success",
                   callback: function() { saveGame(); }
                },
                loadR: {
                    label: "LoadRom",
                    className: "btn-primary",
                    callback: function() { loadRom(); }
                },
                loadS: {
                    label: "LoadSave",
                    className: "btn-primary",
                    callback: function() { loadSave(); }
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
            message: getSaveSlots(),
            buttons: {
                    success: {
                        label: "Save",
                        className: "btn-success",
                        callback: function () {
                            var answer = $("input[name='item']:checked").val()
                            console.log("You've chosen: " + answer);
                            gbSaveGame(answer);
                            //alertify.delay(2000).success("Saved Game!");
                            resumeGame();
                            alertify.delay(2000).success("Saved Game!");

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




    function getSaveSlots() {
        slot_list = [];
        var i = 0;
        for (i = 0; i < slots; ++i) {
            slot_list.push("slot " + i);
        }
        return getHTMLList(slot_list);
    }

    function loadRom() {
        bootbox.dialog({
                title: "Load ROM",
                message: getHTMLList(roms),
                buttons: {
                    success: {
                        label: "LoadRom",
                        className: "btn-success",
                        callback: function () {
                            var romname = $("input[name='item']:checked").val()
                            console.log("You've chosen: " + romname);
                            gbLoadRom(romname);
                        }
                    }
                },
                onEscape: function() {showInitialMenu(); }
            });
    }

    function gbLoadRom(rom) {
        ws.send("loadRom:" + rom);
        resumeGame();
    }

    function gbLoadSave(save) {
        ws.send("loadSave:" + save.slice(-1));
        resumeGame();
    }

    function loadSave() {
        bootbox.dialog({
                    title: "Load Save",
                    message: getHTMLList(saves),
                    buttons: {
                        success: {
                            label: "LoadSave",
                            className: "btn-success",
                            callback: function () {
                                var savename = $("input[name='item']:checked").val()
                                console.log("You've chosen: " + savename);
                                gbLoadSave(savename);
                            }
                        }
                    },
                    onEscape: function() {showInitialMenu(); }
                });
    }

    function getHTMLList(items) {
        innerList = '';
        for (i = 0; i < items.length; ++i) {
            innerList += '<div class="radio">' +
                             '<label for="' + items[i] + '">' +
                                 '<input type="radio" name="item" id="' + items[i] + '" value="' + items[i] + '"> ' + items[i] +
                             '</label> ' +
                         '</div>';
        }
        return '<div class="form-group">' +
                   '<div class="col-md-4">' + innerList + '</div>' +
               '</div>';
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

    function gbSaveGame(slot) {
        ws.send("save:" + slot.slice(-1));
    }


    function setUser(user) {
        current_user = user;
        ws.send("set:" + user);
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

    //render received frame onto screen
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
