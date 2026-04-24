class Keyboard {
    constructor(opts) {
        if (!opts.layout || !opts.container) throw "Missing options";

        const layout = JSON.parse(require("fs").readFileSync(opts.layout, {encoding: "utf-8"}));
        this.ctrlseq = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
        this.container = document.getElementById(opts.container);

        this.linkedToTerm = true;
        this.detach = () => {
            this.linkedToTerm = false;
        };
        this.attach = () => {
            this.linkedToTerm = true;
        };

        // Set default keyboard properties
        this.container.dataset.isShiftOn = false;
        this.container.dataset.isCapsLckOn = false;
        this.container.dataset.isAltOn = false;
        this.container.dataset.isCtrlOn = false;
        this.container.dataset.isFnOn = false;

        this.container.dataset.passwordMode = false;

        // Build arrays for enabling keyboard shortcuts
        this._shortcuts = {
            CtrlAltShift: [],
            CtrlAlt: [],
            CtrlShift: [],
            AltShift: [],
            Ctrl: [],
            Alt: [],
            Shift: []
        };
        window.shortcuts.forEach(scut => {
            let cut = Object.assign({}, scut);
            let mods = cut.trigger.split("+");
            cut.trigger = mods.pop();

            let order = ["Ctrl", "Alt", "Shift"];
            mods.sort((a, b) => {
                return order.indexOf(a) - order.indexOf(b);
            });

            let cat = mods.join("");
            
            if (cut.type === "app" && cut.action === "TAB_X" && cut.trigger === "X") {
                for (let i = 1; i <= 5; i++) {
                    let ncut = Object.assign({}, cut);
                    ncut.trigger = `${i}`;
                    ncut.action = `TAB_${i}`;
                    this._shortcuts[cat].push(ncut);
                }
            } else {
                this._shortcuts[cat].push(cut);
            }
        });

        // Parse keymap and create DOM
        Object.keys(layout).forEach(row => {
            this.container.innerHTML += `<div class="keyboard_row" id="`+row+`"></div>`;
            layout[row].forEach(keyObj => {

                let key = document.createElement("div");
                key.setAttribute("class", "keyboard_key");

                if (keyObj.cmd === " ") {
                    key.setAttribute("id", "keyboard_spacebar");
                } else if (keyObj.cmd === "\r") {
                    key.setAttribute("class", "keyboard_key keyboard_enter");
                    key.innerHTML = `<h1>${keyObj.name}</h1>`;
                } else {
                    key.innerHTML = `
                        <h5>${keyObj.altshift_name || ""}</h5>
                        <h4>${keyObj.fn_name || ""}</h4>
                        <h3>${keyObj.alt_name || ""}</h3>
                        <h2>${keyObj.shift_name || ""}</h2>
                        <h1>${keyObj.name || ""}</h1>`;
                }

                // Icon support, overrides previously defined innerHTML
                // Arrow and other icons
                let icon = null;
                if (keyObj.name.startsWith("ESCAPED|-- ICON: ")) {
                    keyObj.name = keyObj.name.substr(17);
                    switch(keyObj.name) {
                        case "ARROW_UP":
                            icon = `<svg viewBox="0 0 24.00 24.00"><path fill-opacity="1" d="m12.00004 7.99999 4.99996 5h-2.99996v4.00001h-4v-4.00001h-3z"/><path stroke-linejoin="round" fill-opacity="0.65" d="m4 3h16c1.1046 0 1-0.10457 1 1v16c0 1.1046 0.1046 1-1 1h-16c-1.10457 0-1 0.1046-1-1v-16c0-1.10457-0.10457-1 1-1zm0 1v16h16v-16z"/></svg>`;
                            break;
                        case "ARROW_LEFT":
                            icon = `<svg viewBox="0 0 24.00 24.00"><path fill-opacity="1" d="m7.500015 12.499975 5-4.99996v2.99996h4.00001v4h-4.00001v3z"/><path stroke-linejoin="round" fill-opacity="0.65" d="m4 3h16c1.1046 0 1-0.10457 1 1v16c0 1.1046 0.1046 1-1 1h-16c-1.10457 0-1 0.1046-1-1v-16c0-1.10457-0.10457-1 1-1zm0 1v16h16v-16z"/></svg>`;
                            break;
                        case "ARROW_DOWN":
                            icon = `<svg viewBox="0 0 24.00 24.00"><path fill-opacity="1" d="m12 17-4.99996-5h2.99996v-4.00001h4v4.00001h3z"/><path stroke-linejoin="round" fill-opacity="0.65" d="m4 3h16c1.1046 0 1-0.10457 1 1v16c0 1.1046 0.1046 1-1 1h-16c-1.10457 0-1 0.1046-1-1v-16c0-1.10457-0.10457-1 1-1zm0 1v16h16v-16z"/></svg>`;
                            break;
                        case "ARROW_RIGHT":
                            icon = `<svg viewBox="0 0 24.00 24.00"><path fill-opacity="1" d="m16.500025 12.500015-5 4.99996v-2.99996h-4.00001v-4h4.00001v-3z"/><path stroke-linejoin="round" fill-opacity="0.65" d="m4 3h16c1.1046 0 1-0.10457 1 1v16c0 1.1046 0.1046 1-1 1h-16c-1.10457 0-1 0.1046-1-1v-16c0-1.10457-0.10457-1 1-1zm0 1v16h16v-16z"/></svg>`;
                            break;
                        default:
                            icon = `<svg viewBox="0 0 24.00 24.00"><path fill="#ff0000" fill-opacity="1" d="M 8.27125,2.9978L 2.9975,8.27125L 2.9975,15.7275L 8.27125,21.0012L 15.7275,21.0012C 17.485,19.2437 21.0013,15.7275 21.0013,15.7275L 21.0013,8.27125L 15.7275,2.9978M 9.10125,5L 14.9025,5L 18.9988,9.10125L 18.9988,14.9025L 14.9025,18.9988L 9.10125,18.9988L 5,14.9025L 5,9.10125M 9.11625,7.705L 7.705,9.11625L 10.5912,12.0025L 7.705,14.8825L 9.11625,16.2937L 12.0025,13.4088L 14.8825,16.2937L 16.2938,14.8825L 13.4087,12.0025L 16.2938,9.11625L 14.8825,7.705L 12.0025,10.5913"/></svg>`;
                    }

                    key.innerHTML = icon;
                }

                Object.keys(keyObj).forEach(property => {
                    for (let i = 1; i < this.ctrlseq.length; i++) {
                        keyObj[property] = keyObj[property].replace("~~~CTRLSEQ"+i+"~~~", this.ctrlseq[i]);
                    }
                    if (property.endsWith("cmd")) {
                        key.dataset[property] = keyObj[property];
                    }
                });

                document.getElementById(row).appendChild(key);
            });
        });

        this.container.childNodes.forEach(row => {
            row.childNodes.forEach(key => {

                let enterElements = document.querySelectorAll(".keyboard_enter");

                if (key.attributes["class"].value.endsWith("keyboard_enter")) {
                    // The enter key is divided in two dom elements, so we bind their animations here

                    key.onmousedown = e => {
                        this.pressKey(key);
                        key.holdTimeout = setTimeout(() => {
                            key.holdInterval = setInterval(() => {
                                this.pressKey(key);
                            }, 70);
                        }, 400);

                        enterElements.forEach(key => {
                            key.setAttribute("class", "keyboard_key active keyboard_enter");
                        });

                        // Keep focus on the terminal
                        if (window.keyboard.linkedToTerm) window.term[window.currentTerm].term.focus();
                        if (this.container.dataset.passwordMode == "false")
                            window.audioManager.granted.play();
                        e.preventDefault();
                    };
                    key.onmouseup = () => {
                        clearTimeout(key.holdTimeout);
                        clearInterval(key.holdInterval);

                        enterElements.forEach(key => {
                            key.setAttribute("class", "keyboard_key blink keyboard_enter");
                        });
                        setTimeout(() => {
                            enterElements.forEach(key => {
                                key.setAttribute("class", "keyboard_key keyboard_enter");
                            });
                        }, 100);
                    };
                } else {
                    key.onmousedown = e => {
                        if (/^ESCAPED\|-- (CTRL|SHIFT|ALT){1}.*/.test(key.dataset.cmd)) {
                            let cmd = key.dataset.cmd.substr(11);
                            if (cmd.startsWith("CTRL")) {
                                this.container.dataset.isCtrlOn = "true";
                            }
                            if (cmd.startsWith("SHIFT")) {
                                this.container.dataset.isShiftOn = "true";
                            }
                            if (cmd.startsWith("ALT")) {
                                this.container.dataset.isAltOn = "true";
                            }
                        } else {
                            key.holdTimeout = setTimeout(() => {
                                key.holdInterval = setInterval(() => {
                                    this.pressKey(key);
                                }, 70);
                            }, 400);
                            this.pressKey(key);
                        }

                        // Keep focus on the terminal
                        if (window.keyboard.linkedToTerm) window.term[window.currentTerm].term.focus();
                        if(this.container.dataset.passwordMode == "false")
                            window.audioManager.stdin.play();
                        e.preventDefault();
                    };
                    key.onmouseup = e => {
                        if (/^ESCAPED\|-- (CTRL|SHIFT|ALT){1}.*/.test(key.dataset.cmd)) {
                            let cmd = key.dataset.cmd.substr(11);
                            if (cmd.startsWith("CTRL")) {
                                this.container.dataset.isCtrlOn = "false";
                            }
                            if (cmd.startsWith("SHIFT")) {
                                this.container.dataset.isShiftOn = "false";
                            }
                            if (cmd.startsWith("ALT")) {
                                this.container.dataset.isAltOn = "false";
                            }
                        } else {
                            clearTimeout(key.holdTimeout);
                            clearInterval(key.holdInterval);
                        }

                        key.setAttribute("class", "keyboard_key blink");
                        setTimeout(() => {
                            key.setAttribute("class", "keyboard_key");
                        }, 100);
                    };
                }

                key.onmouseleave = () => {
                    clearTimeout(key.holdTimeout);
                    clearInterval(key.holdInterval);
                };
            });
        });

        // Tactile multi-touch support (#100)
        this.container.addEventListener("touchstart", e => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                let key = e.changedTouches[i].target.parentElement;
                if (key.tagName === "svg") key = key.parentElement;
                if (key.getAttribute("class").startsWith("keyboard_key")) {
                    key.setAttribute("class", key.getAttribute("class") + " active");
                    key.onmousedown({preventDefault: () => {return true}});
                } else {
                    key = e.changedTouches[i].target;
                    if (key.getAttribute("class").startsWith("keyboard_key")) {
                        key.onmousedown({preventDefault: () => {return true}});
                    }
                }
            }
            e.preventDefault();
        });

        const dropKeyTouchHandler = e => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                let key = e.changedTouches[i].target.parentElement;
                if (key.tagName === "svg") key = key.parentElement;
                if (key.getAttribute("class").startsWith("keyboard_key")) {
                    key.setAttribute("class", key.getAttribute("class").replace("active", ""));
                    key.onmouseup({preventDefault: () => {return true}});
                } else {
                    key = e.changedTouches[i].target;
                    if (key.getAttribute("class").startsWith("keyboard_key")) {
                        key.setAttribute("class", key.getAttribute("class").replace("active", ""));
                        key.onmouseup({preventDefault: () => {return true}});
                    }
                }
            }
        };
        this.container.addEventListener("touchend", dropKeyTouchHandler);
        this.container.addEventListener("touchcancel", dropKeyTouchHandler);

        // Bind actual keyboard actions to on-screen animations (for use without a touchscreen)
        let findKey = e => {
            // Fix incorrect querySelector error
            let physkey;
            (e.key === "\"") ? physkey = `\\"` : physkey = e.key;

            // Find basic keys (typically letters, upper and lower-case)
            let key = document.querySelector('div.keyboard_key[data-cmd="'+physkey+'"]');
            if (key === null) key = document.querySelector('div.keyboard_key[data-shift_cmd="'+physkey+'"]');

            // Find special keys (shift, control, arrows, etc.)
            if (key === null && e.code === "ShiftLeft") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- SHIFT: LEFT"]');
            if (key === null && e.code === "ShiftRight") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- SHIFT: RIGHT"]');
            if (key === null && e.code === "ControlLeft") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- CTRL: LEFT"]');
            if (key === null && e.code === "ControlRight") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- CTRL: RIGHT"]');
            if (key === null && e.code === "AltLeft") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- FN: ON"]');
            if (key === null && e.code === "AltRight") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- ALT: RIGHT"]');
            if (key === null && e.code === "CapsLock") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- CAPSLCK: ON"]');
            if (key === null && e.code === "Escape") key = document.querySelector('div.keyboard_key[data-cmd=""]');
            if (key === null && e.code === "Backspace") key = document.querySelector('div.keyboard_key[data-cmd=""]');
            if (key === null && e.code === "ArrowUp") key = document.querySelector('div.keyboard_key[data-cmd="OA"]');
            if (key === null && e.code === "ArrowLeft") key = document.querySelector('div.keyboard_key[data-cmd="OD"]');
            if (key === null && e.code === "ArrowDown") key = document.querySelector('div.keyboard_key[data-cmd="OB"]');
            if (key === null && e.code === "ArrowRight") key = document.querySelector('div.keyboard_key[data-cmd="OC"]');
            if (key === null && e.code === "Enter") key = document.querySelectorAll('div.keyboard_key.keyboard_enter');

            // Find "rare" keys (ctrl and alt symbols)
            if (key === null) key = document.querySelector('div.keyboard_key[data-ctrl_cmd="'+e.key+'"]');
            if (key === null) key = document.querySelector('div.keyboard_key[data-alt_cmd="'+e.key+'"]');

            return key;
        };

        this.keydownHandler = e => {
            // See #330
            if (e.getModifierState("AltGraph") && e.code === "AltRight") {
                document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- CTRL: LEFT"]').setAttribute("class", "keyboard_key");
            }

            // See #440
            if (e.code === "ControlLeft" || e.code === "ControlRight") this.container.dataset.isCtrlOn = true;
            if (e.code === "ShiftLeft" || e.code === "ShiftRight") this.container.dataset.isShiftOn = true;
            if (e.code === "AltLeft" || e.code === "AltRight") this.container.dataset.isAltOn = true;
            if (e.code === "CapsLock" && this.container.dataset.isCapsLckOn !== "true") this.container.dataset.isCapsLckOn = true;
            if (e.code === "CapsLock" && this.container.dataset.isCapsLckOn === "true") this.container.dataset.isCapsLckOn = false;

            let key = findKey(e);
            if (key === null) return;
            if (key.length) {
                key.forEach(enterElement => {
                    enterElement.setAttribute("class", "keyboard_key active keyboard_enter");
                });
            } else {
                key.setAttribute("class", "keyboard_key active");
            }

            // See #516
            if (e.repeat === false || (e.repeat === true && !e.code.startsWith('Shift') && !e.code.startsWith('Alt') && !e.code.startsWith('Control') && !e.code.startsWith('Caps'))) {
                if(this.container.dataset.passwordMode == "false")
                    window.audioManager.stdin.play();
            }
        };

        document.onkeydown = this.keydownHandler;

        document.onkeyup = e => {
            // See #330
            if (e.key === "Control" && e.getModifierState("AltGraph")) return;

            // See #440
            if (e.code === "ControlLeft" || e.code === "ControlRight") this.container.dataset.isCtrlOn = false;
            if (e.code === "ShiftLeft" || e.code === "ShiftRight") this.container.dataset.isShiftOn = false;
            if (e.code === "AltLeft" || e.code === "AltRight") this.container.dataset.isAltOn = false;

            let key = findKey(e);
            if (key === null) return;
            if (key.length) {
                key.forEach(enterElement => {
                    enterElement.setAttribute("class", "keyboard_key blink keyboard_enter");
                });
                setTimeout(() => {
                    key.forEach(enterElement => {
                        enterElement.setAttribute("class", "keyboard_key keyboard_enter");
                    });
                }, 100);
            } else {
                key.setAttribute("class", "keyboard_key blink");
                setTimeout(() => {
                    key.setAttribute("class", "keyboard_key");
                }, 100);
            }

            if(this.container.dataset.passwordMode == "false" && e.key === "Enter")
                window.audioManager.granted.play();
        };

        window.addEventListener("blur", () => {
            document.querySelectorAll("div.keyboard_key.active").forEach(key => {
                key.setAttribute("class", key.getAttribute("class").replace("active", ""));
                key.onmouseup({preventDefault: () => {return true}});
            });
        });
    }
    pressKey(key) {
        let cmd = key.dataset.cmd || "";

        // Keyboard shortcuts
        let shortcutsCat = "";
        if (this.container.dataset.isCtrlOn === "true") shortcutsCat += "Ctrl";
        if (this.container.dataset.isAltOn === "true") shortcutsCat += "Alt";
        if (this.container.dataset.isShiftOn === "true") shortcutsCat += "Shift";

        let shortcutsTriggered = false;

        if (shortcutsCat.length > 1) {
            this._shortcuts[shortcutsCat].forEach(cut => {
                if (!cut.enabled) return;
        
                let trig = cut.trigger.toLowerCase()
                                    .replace("plus", "+")
                                    .replace("space", " ")
                                    .replace("tab", "\t")
                                    .replace(/backspace|delete/, "\b")
                                    .replace(/esc|escape/, this.ctrlseq[1])
                                    .replace(/return|enter/, "\r");

                if (cmd !== trig) return;

                if (cut.type === "app") {
                    window.useAppShortcut(cut.action);
                    shortcutsTriggered = true;
                } else if (cut.type === "shell") {
                    let fn = (cut.linebreak) ? writelr : write;
                    window.term[window.currentTerm][fn](cut.action);
                } else {
                    console.warn(`${cut.trigger} has unknown type`);
                }
            });
        }

        if (shortcutsTriggered) return;

        // Modifiers
        if (this.container.dataset.isShiftOn === "true" && key.dataset.shift_cmd || this.container.dataset.isCapsLckOn === "true" && key.dataset.shift_cmd) cmd = key.dataset.shift_cmd;
        if (this.container.dataset.isCapsLckOn === "true" && key.dataset.capslck_cmd) cmd = key.dataset.capslck_cmd;
        if (this.container.dataset.isCtrlOn === "true" && key.dataset.ctrl_cmd) cmd = key.dataset.ctrl_cmd;
        if (this.container.dataset.isAltOn === "true" && key.dataset.alt_cmd) cmd = key.dataset.alt_cmd;
        if (this.container.dataset.isAltOn === "true" && this.container.dataset.isShiftOn === "true" && key.dataset.altshift_cmd) cmd = key.dataset.altshift_cmd;
        if (this.container.dataset.isFnOn === "true" && key.dataset.fn_cmd) cmd = key.dataset.fn_cmd;
        if (this.container.dataset.isNextCircum === "true") {
            cmd = this.addCircum(cmd);
            this.container.dataset.isNextCircum = "false";
        }
        if (this.container.dataset.isNextTrema === "true") {
            cmd = this.addTrema(cmd);
            this.container.dataset.isNextTrema = "false";
        }
        if (this.container.dataset.isNextAcute === "true") {
            cmd = this.addAcute(cmd);
            this.container.dataset.isNextAcute = "false";
        }
        if (this.container.dataset.isNextGrave === "true") {
            cmd = this.addGrave(cmd);
            this.container.dataset.isNextGrave = "false";
        }
        if (this.container.dataset.isNextCaron === "true") {
            cmd = this.addCaron(cmd);
            this.container.dataset.isNextCaron = "false";
        }
        if (this.container.dataset.isNextBar === "true") {
            cmd = this.addBar(cmd);
            this.container.dataset.isNextBar = "false";
        }
        if (this.container.dataset.isNextBreve === "true") {
            cmd = this.addBreve(cmd);
            this.container.dataset.isNextBreve = "false";
        }
        if (this.container.dataset.isNextTilde === "true") {
            cmd = this.addTilde(cmd);
            this.container.dataset.isNextTilde = "false";
        }
        if (this.container.dataset.isNextMacron === "true") {
            cmd = this.addMacron(cmd);
            this.container.dataset.isNextMacron = "false";
        }
        if (this.container.dataset.isNextCedilla === "true") {
            cmd = this.addCedilla(cmd);
            this.container.dataset.isNextCedilla = "true";
        }
        if (this.container.dataset.isNextOverring === "true") {
            cmd = this.addOverring(cmd);
            this.container.dataset.isNextOverring = "false";
        }
        if (this.container.dataset.isNextGreek === "true") {
            cmd = this.toGreek(cmd);
            this.container.dataset.isNextGreek = "false";
        }
        if (this.container.dataset.isNextIotasub === "true") {
            cmd = this.addIotasub(cmd);
            this.container.dataset.isNextIotasub = "false";
        }

        // Escaped commands
        if (cmd.startsWith("ESCAPED|-- ")) {
            cmd = cmd.substr(11);
            switch(cmd) {
                case "CAPSLCK: ON":
                    this.container.dataset.isCapsLckOn = "true";
                    return true;
                case "CAPSLCK: OFF":
                    this.container.dataset.isCapsLckOn = "false";
                    return true;
                case "FN: ON":
                    this.container.dataset.isFnOn = "true";
                    return true;
                case "FN: OFF":
                    this.container.dataset.isFnOn = "false";
                    return true;
                case "CIRCUM":
                    this.container.dataset.isNextCircum = "true";
                    return true;
                case "TREMA":
                    this.container.dataset.isNextTrema = "true";
                    return true;
                case "ACUTE":
                    this.container.dataset.isNextAcute = "true";
                    return true;
                case "GRAVE":
                    this.container.dataset.isNextGrave = "true";
                    return true;
                case "CARON":
                    this.container.dataset.isNextCaron = "true";
                    return true;
                case "BAR":
                    this.container.dataset.isNextBar = "true";
                    return true;
                case "BREVE":
                    this.container.dataset.isNextBreve = "true";
                    return true;
                case "TILDE":
                    this.container.dataset.isNextTilde = "true";
                    return true;
                case "MACRON":
                    this.container.dataset.isNextMacron = "true";
                    return true;
                case "CEDILLA":
                    this.container.dataset.isNextCedilla = "true";
                    return true;
                case "OVERRING":
                    this.container.dataset.isNextOverring = "true";
                    return true;
                case "GREEK":
                    this.container.dataset.isNextGreek = "true";
                    return true;
                case "IOTASUB":
                    this.container.dataset.isNextIotasub = "true";
                    return true;
            }
        }


        if (cmd === "\n") {
            if (window.keyboard.linkedToTerm) {
                window.term[window.currentTerm].writelr("");
            } else {
                document.activeElement.dispatchEvent(new CustomEvent("change", {detail: "enter" }));
            }
            return true;
        }


        if (window.keyboard.linkedToTerm) {
            window.term[window.currentTerm].write(cmd);
        } else {
            let isDelete = false;
            if (typeof document.activeElement.value !== "undefined") {
                switch(cmd) {
                    case "":
                        document.activeElement.value = document.activeElement.value.slice(0, -1);
                        isDelete = true;
                        break;
                    case "OD":
                        document.activeElement.selectionStart--;
                        document.activeElement.selectionEnd = document.activeElement.selectionStart;
                        break;
                    case "OC":
                        document.activeElement.selectionEnd++;
                        document.activeElement.selectionStart = document.activeElement.selectionEnd;
                        break;
                    default:
                        if (this.ctrlseq.indexOf(cmd.slice(0, 1)) !== -1) {
                            // Prevent trying to write other control sequences
                        } else {
                            document.activeElement.value = document.activeElement.value+cmd;
                        }
                }
            }
            // Emulate oninput events
            document.activeElement.dispatchEvent(new CustomEvent("input", {detail: ((isDelete)? "delete" : "insert") }));
            document.activeElement.focus();
        }
    }
    togglePasswordMode() {
        let d = this.container.dataset.passwordMode;
        (d === "true") ? d = "false" : d = "true";
        this.container.dataset.passwordMode = d;
        window.passwordMode = d;
        return d;
    }
    addCircum(char) {
        switch(char) {
            case "a":
                return "â";
            case "A":
                return "Â";
            case "z":
                return "ẑ";
            case "Z":
                return "Ẑ";
            case "e":
                return "ê";
            case "E":
                return "Ê";
            case "y":
                return "ŷ";
            case "Y":
                return "Ŷ";
            case "u":
                return "û";
            case "U":
                return "Û";
            case "i":
                return "î";
            case "I":
                return "Î";
            case "o":
                return "ô";
            case "O":
                return "Ô";
            case "s":
                return "ŝ";
            case "S":
                return "Ŝ";
            case "g":
                return "ĝ";
            case "G":
                return "Ĝ";
            case "h":
                return "ĥ";
            case "H":
                return "Ĥ";
            case "j":
                return "ĵ";
            case "J":
                return "Ĵ";
            case "w":
                return "ŵ";
            case "W":
                return "Ŵ";
            case "c":
                return "ĉ";
            case "C":
                return "Ĉ";
            // the circumflex can also be used for superscript numbers
            case "1":
                return "¹";
            case "2":
                return "²";
            case "3":
                return "³";
            case "4":
                return "⁴";
            case "5":
                return "⁵";
            case "6":
                return "⁶";
            case "7":
                return "⁷";
            case "8":
                return "⁸";
            case "9":
                return "⁹";
            case "0":
                return "⁰";
            default:
                return char;
        }
    }
    addTrema(char) {
        switch(char) {
            case "a":
                return "ä";
            case "A":
                return "Ä";
            case "e":
                return "ë";
            case "E":
                return "Ë";
            case "t":
                return "ẗ";
            // My keyboard says no uppercase ẗ
            case "y":
                return "ÿ";
            case "Y":
                return "Ÿ";
            case "u":
                return "ü";
            case "U":
                return "Ü";
            case "i":
                return "ï";
            case "I":
                return "Ï";
            case "o":
                return "ö";
            case "O":
                return "Ö";
            case "h":
                return "ḧ";
            case "H":
                return "Ḧ";
            case "w":
                return "ẅ";
            case "W":
                return "Ẅ";
            case "x":
                return "ẍ";
            case "X":
                return "Ẍ";
            default:
                return char;
        }
    }
    addAcute(char) {
        switch(char) {
            case "a":
                return "á";
            case "A":
                return "Á";
            case "c":
                return "ć";
            case "C":
                return "Ć";
            case "e":
                return "é";
            case "E":
                return "E";
            case "g":
                return "ǵ";
            case "G":
                return "Ǵ";
            case "i":
                return "í";
            case "I":
                return "Í";
            case "j":
                return "ȷ́";
            case "J":
                return "J́";
            case "k":
                return "ḱ";
            case "K":
                return "Ḱ";
            case "l":
                return "ĺ";
            case "L":
                return "Ĺ";
            case "m":
                return "ḿ";
            case "M":
                return "Ḿ";
            case "n":
                return "ń";
            case "N":
                return "Ń";
            case "o":
                return "ó";
            case "O":
                return "Ó";
            case "p":
                return "ṕ";
            case "P":
                return "Ṕ";
            case "r":
                return "ŕ";
            case "R":
                return "Ŕ";
            case "s":
                return "ś";
            case "S":
                return "Ś";
            case "u":
                return "ú";
            case "U":
                return "Ú";
            case "v":
                return "v́";
            case "V":
                return "V́";
            case "w":
                return "ẃ";
            case "W":
                return "Ẃ";
            case "y":
                return "ý";
            case "Y":
                return "Ý";
            case "z":
                return "ź";
            case "Z":
                return "Ź";
            case "ê":
                return "ế";
            case "Ê":
                return "Ế";
            case "ç":
                return "ḉ";
            case "Ç":
                return "Ḉ";
            default:
                return char;
        }
    }
    addGrave(char) {
        switch (char) {
            case "a":
                return "à";
            case "A":
                return "À";
            case "e":
                return "è";
            case "E":
                return "È";
            case "i":
                return "ì";
            case "I":
                return "Ì";
            case "m":
                return "m̀";
            case "M":
                return "M̀";
            case "n":
                return "ǹ";
            case "N":
                return "Ǹ";
            case "o":
                return "ò";
            case "O":
                return "Ò";
            case "u":
                return "ù";
            case "U":
                return "Ù";
            case "v":
                return "v̀";
            case "V":
                return "V̀";
            case "w":
                return "ẁ";
            case "W":
                return "Ẁ";
            case "y":
                return "ỳ";
            case "Y":
                return "Ỳ";
            case "ê":
                return "ề";
            case "Ê":
                return "Ề";
            default:
                return char;
        }
    }
    addCaron(char) {
        switch (char) {
            case "a":
                return "ǎ";
            case "A":
                return "Ǎ";
            case "c":
                return "č";
            case "C":
                return "Č";
            case "d":
                return "ď";
            case "D":
                return "Ď";
            case "e":
                return "ě";
            case "E":
                return "Ě";
            case "g":
                return "ǧ";
            case "G":
                return "Ǧ";
            case "h":
                return "ȟ";
            case "H":
                return "Ȟ";
            case "i":
                return "ǐ";
            case "I":
                return "Ǐ";
            case "j":
                return "ǰ";
            case "k":
                return "ǩ";
            case "K":
                return "Ǩ";
            case "l":
                return "ľ";
            case "L":
                return "Ľ";
            case "n":
                return "ň";
            case "N":
                return "Ň";
            case "o":
                return "ǒ";
            case "O":
                return "Ǒ";
            case "r":
                return "ř";
            case "R":
                return "Ř";
            case "s":
                return "š";
            case "S":
                return "Š";
            case "t":
                return "ť";
            case "T":
                return "Ť";
            case "u":
                return "ǔ";
            case "U":
                return "Ǔ";
            case "z":
                return "ž";
            case "Z":
                return "Ž";
            // caron can also be used for subscript numbers
            case "1":
                return "₁";
            case "2":
                return "₂";
            case "3":
                return "₃";
            case "4":
                return "₄";
            case "5":
                return "₅";
            case "6":
                return "₆";
            case "7":
                return "₇";
            case "8":
                return "₈";
            case "9":
                return "₉";
            case "0":
                return "₀";
            default:
                return char;
        }
    }
    addBar(char) {
        switch (char) {
            case "a":
                return "ⱥ";
            case "A":
                return "Ⱥ";
            case "b":
                return "ƀ";
            case "B":
                return "Ƀ";
            case "c":
                return "ȼ";
            case "C":
                return "Ȼ";
            case "d":
                return "đ";
            case "D":
                return "Đ";
            case "e":
                return "ɇ";
            case "E":
                return "Ɇ";
            case "g":
                return "ǥ";
            case "G":
                return "Ǥ";
            case "h":
                return "ħ";
            case "H":
                return "Ħ";
            case "i":
                return "ɨ";
            case "I":
                return "Ɨ";
            case "j":
                return "ɉ";
            case "J":
                return "Ɉ";
            case "l":
                return "ł";
            case "L":
                return "Ł";
            case "o":
                return "ø";
            case "O":
                return "Ø";
            case "p":
                return "ᵽ";
            case "P":
                return "Ᵽ";
            case "r":
                return "ɍ";
            case "R":
                return "Ɍ";
            case "t":
                return "ŧ";
            case "T":
                return "Ŧ";
            case "u":
                return "ʉ";
            case "U":
                return "Ʉ";
            case "y":
                return "ɏ";
            case "Y":
                return "Ɏ";
            case "z":
                return "ƶ";
            case "Z":
                return "Ƶ";
            default:
                return char;
        }
    }
    addBreve(char) {
        switch (char) {
            case "a":
                return "ă";
            case "A":
                return "Ă";
            case "e":
                return "ĕ";
            case "E":
                return "Ĕ";
            case "g":
                return "ğ";
            case "G":
                return "Ğ";
            case "i":
                return "ĭ";
            case "I":
                return "Ĭ";
            case "o":
                return "ŏ";
            case "O":
                return "Ŏ";
            case "u":
                return "ŭ";
            case "U":
                return "Ŭ";
            case "à":
                return "ằ";
            case "À":
                return "Ằ";
            default:
                return char;
        }
    }
    addTilde(char) {
        switch (char) {
            case "a":
                return "ã";
            case "A":
                return "Ã";
            case "e":
                return "ẽ";
            case "E":
                return "Ẽ";
            case "i":
                return "ĩ";
            case "I":
                return "Ĩ";
            case "n":
                return "ñ";
            case "N":
                return "Ñ";
            case "o":
                return "õ";
            case "O":
                return "Õ";
            case "u":
                return "ũ";
            case "U":
                return "Ũ";
            case "v":
                return "ṽ";
            case "V":
                return "Ṽ";
            case "y":
                return "ỹ";
            case "Y":
                return "Ỹ";
            case "ê":
                return "ễ";
            case "Ê":
                return "Ễ";
            default:
                return char;
        }
    }
    addMacron(char) {
        switch (char) {
            case "a":
                return "ā";
            case "A":
                return "Ā";
            case "e":
                return "ē";
            case "E":
                return "Ē";
            case "g":
                return "ḡ";
            case "G":
                return "Ḡ";
            case "i":
                return "ī";
            case "I":
                return "Ī";
            case "o":
                return "ō";
            case "O":
                return "Ō";
            case "u":
                return "ū";
            case "U":
                return "Ū";
            case "y":
                return "ȳ";
            case "Y":
                return "Ȳ";
            case "é":
                return "ḗ";
            case "É":
                return "Ḗ";
            case "è":
                return "ḕ";
            case "È":
                return "Ḕ";
            default:
                return char;
        }
    }
    addCedilla(char) {
        switch (char) {
            case "c":
                return "ç";
            case "C":
                return "Ç";
            case "d":
                return "ḑ";
            case "D":
                return "Ḑ";
            case "e":
                return "ȩ";
            case "E":
                return "Ȩ";
            case "g":
                return "ģ";
            case "G":
                return "Ģ";
            case "h":
                return "ḩ";
            case "H":
                return "Ḩ";
            case "k":
                return "ķ";
            case "K":
                return "Ķ";
            case "l":
                return "ļ";
            case "L":
                return "Ļ";
            case "n":
                return "ņ";
            case "N":
                return "Ņ";
            case "r":
                return "ŗ";
            case "R":
                return "Ŗ";
            case "s":
                return "ş";
            case "S":
                return "Ş";
            case "t":
                return "ţ";
            case "T":
                return "Ţ";
            default:
                return char;
        }
    }
    addOverring(char) {
        switch (char) {
            case "a":
                return "å";
            case "A":
                return "Å";
            case "u":
                return "ů";
            case "U":
                return "Ů";
            case "w":
                return "ẘ"; // capital w with overring not supported on bépo layout apparently
            case "y":
                return "ẙ"; // same for capital y with overring
            default:
                return char;
        }
    }
    toGreek(char) {
        switch (char) {
            case "b":
                return "β";
            case "p":
                return "π";
            case "P":
                return "Π";
            case "d":
                return "δ";
            case "D":
                return "Δ";
            case "l":
                return "λ";
            case "L":
                return "Λ";
            case "j":
                return "θ";
            case "J":
                return "Θ";
            case "z":
                return "ζ";
            case "w":
                return "ω";
            case "W":
                return "Ω";
            case "A":
                return "α";
            case "u":
                return "υ";
            case "U":
                return "Υ";
            case "i":
                return "ι";
            case "e":
                return "ε";
            case "t":
                return "τ";
            case "s":
                return "σ";
            case "S":
                return "Σ";
            case "r":
                return "ρ";
            case "R":
                return "Ρ";
            case "n":
                return "ν";
            case "m":
                return "μ";
            case "y":
                return "ψ";
            case "Y":
                return "Ψ";
            case "x":
                return "ξ";
            case "X":
                return "Ξ";
            case "k":
                return "κ";
            case "q":
                return "χ";
            case "Q":
                return "Χ";
            case "g":
                return "γ";
            case "G":
                return "Γ";
            case "h":
                return "η";
            case "f":
                return "φ";
            case "F":
                return "Φ";
            default:
                return char;
        }
    }
    addIotasub(char) {
        switch (char) {
            case "o":
                return "ǫ";
            case "O":
                return "Ǫ";
            case "a":
                return "ą";
            case "A":
                return "Ą";
            case "u":
                return "ų";
            case "U":
                return "Ų";
            case "i":
                return "į";
            case "I":
                return "Į";
            case "e":
                return "ę";
            case "E":
                return "Ę";
            default:
                return char;
        }
    }
}

module.exports = {
    Keyboard
};
