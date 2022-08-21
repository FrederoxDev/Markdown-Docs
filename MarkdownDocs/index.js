import clipboardy from 'clipboardy';
import { readFile } from "fs/promises"

const icons = {
    "armor": "",
    "food": "",
    "minecoin": "",
    "token": "",
    "agent": "",
    "immersive_reader": "",
    "craft_toggle_on": "",
    "craft_toggle_off": "",

    "mobile_jump": "",
    "mobile_crouch": "",
    "mobile_fly_up": "",
    "mobile_fly_down": "",
    "mobile_left_arrow": "",
    "mobile_right_arrow": "",
    "mobile_up_arrow": "",
    "mobile_down_arrow": "",

    "pc_left_click": "",
    "pc_right_click": "",
    "pc_middle_click": "",

    "xbox_y": "",
    "xbox_b": "",
    "xbox_a": "",
    "xbox_x": "",
    "xbox_back": "",
    "xbox_start": "",
    "xbox_lb": "",
    "xbox_rb": "",
    "xbox_lt": "",
    "xbox_rt": "",
    "xbox_ls": "",
    "xbox_rs": "",
    "xbox_d_pad_up": "",
    "xbox_d_pad_right": "",
    "xbox_d_pad_down": "",
    "xbox_d_pad_left": ""
}

// Assigns each element with a seperate id. 
var elementIdCounter = 0;
var pageIdCounter = 0;
var categoryIdCounter = 0;

// Json arrays
var sections = []
var buttons = [
    {
        "padding_0": {
            "type": "panel",
            "size": [
                0,
                6
            ]
        }
    }
]
var tips = [
    {
        "section_contents_header@how_to_play_common.section_contents_header": {}
    }
]

function ParseFile(file) {
    var sectionName = "Unnamed"
    var yamlStartIdx = file.indexOf("---") + 3;
    var yamlEndIdx = file.lastIndexOf("---")

    var yaml = file.substring(yamlStartIdx, yamlEndIdx).replaceAll("\r", "").split("\n")

    yaml.forEach((line) => {
        if (yamlStartIdx == -1 || yamlEndIdx == -1) return;
        if (line == "") return;

        var key = line.split(": ")[0]
        var value = line.split(": ")[1]

        if (key == "name") sectionName = value;
    })

    var pageElements = []

    file = file.slice(yamlEndIdx + 3, -1).trim() + " "

    const fileContent = file.split("\n")
    fileContent.forEach((line) => {
        line = line.replace("\r", "");
        line = line + " "

        var isCodeBlock = new RegExp(/\`.*\`/m).test(line)

        var chars = line.split("")
        var lastChar = ""
        var lastLastChar = ""

        var isBoldItalic = false;
        var isBold = false;
        var isItalic = false;
        var isCode = false;
        var isEmoji = false;

        var emojiText = ""

        chars.forEach((char, index) => {
            // Code blocks
            if (char == "`") {
                if (lastChar == "\\") {
                    chars[index - 1] = ""
                }

                else if (!isCode) {
                    chars[index] = ""
                    isCode = true
                }

                else {
                    chars[index] = ""
                    isCode = false
                }
            }

            if (isCode) return;


            if (char == ":") {
                if (!isEmoji) {
                    isEmoji = true;
                    chars[index] = ""
                    return;
                }

                else {
                    var icon = icons[emojiText] || `:${emojiText}:`
                    chars[index] = icon

                    isEmoji = false;
                    emojiText = ""
                }
            }

            if (isEmoji) {
                emojiText += char;
                chars[index] = ""

                return;
            }

            // Bold Italic text (***)
            if (char == "*" && lastChar == "*" && lastLastChar == "*") {
                if (!isBoldItalic) {
                    chars[index] = "§l§o"
                    chars[index - 1] = ""
                    chars[index - 2] = ""
                    isBoldItalic = true
                }

                else {
                    chars[index] = "§r"
                    chars[index - 1] = ""
                    chars[index - 2] = ""
                    isBoldItalic = false
                }
            }

            // Bold text (**)
            if (char == "*" && lastChar == "*" && lastLastChar != "*") {
                if (!isBold) {
                    chars[index - 1] = ""
                    chars[index] = "§l"
                    isBold = true
                }

                else {
                    chars[index - 1] = ""
                    chars[index] = "§r"
                    isBold = false;
                }
            }

            // Italic text (*)
            if (char != "*" && lastChar == "*" && lastLastChar != "*") {
                if (!isItalic) {
                    chars[index - 1] = "§o"
                    isItalic = true
                }

                else {
                    chars[index - 1] = "§r"
                    isItalic = false
                }
            }

            lastLastChar = lastChar;
            lastChar = char;
        })

        line = chars.join("");

        // Images
        if (line.match(/!\(.*\)\[.*\]/m) && !isCodeBlock) {
            var texturePath = line.split("[").pop().split("]")[0]
            var altText = line.split("(").pop().split(")")[0]

            console.log(altText)

            pageElements.push({
                [`image_${elementIdCounter}@how_to_play_common.image`]: {
                    "texture": texturePath
                }
            })

            elementIdCounter++;

            if (altText != "") {
                pageElements.push({
                    [`paragraph_${elementIdCounter}@how_to_play_common.paragraph`]: {
                        "$text": "§7§o" + altText,
                        "$text_alignment": "center"
                    }
                })

                elementIdCounter++;

                pageElements.push({
                    [`padding_${elementIdCounter}@how_to_play_common.padding`]: {}
                })
                elementIdCounter++;
            }

            return;
        }

        // Padding
        if (line == "") {
            pageElements.push({
                [`padding_${elementIdCounter}@how_to_play_common.padding`]: {}
            })
            elementIdCounter++;
            return;
        }

        // Headers
        if (line.startsWith("# ")) {
            line = line.replace("# ", "")
            pageElements.push({
                [`header_${elementIdCounter}@how_to_play_common.header`]: {
                    "$text": line
                }
            })
            elementIdCounter++;
            return;
        }

        // Paragraphs
        pageElements.push({
            [`paragraph_${elementIdCounter}@how_to_play_common.paragraph`]: {
                "$text": line,
                "$text_alignment": "left"
            }
        })
        elementIdCounter++;
    })

    sections.push({
        [`section_${pageIdCounter}_button@how_to_play_common.section_toggle_button`]: {
            "$section_topic": sectionName
        }
    })

    sections.push({
        [`section_${pageIdCounter}@how_to_play_common.main_sections`]: {
            "bindings": [
                {
                    "binding_type": "view",
                    "source_control_name": `${sectionName}_button_toggle`,
                    "source_property_name": "#toggle_state",
                    "target_property_name": "#visible"
                }
            ],
            "controls": pageElements
        }
    })

    buttons.push({
        [`section_${pageIdCounter}_button@how_to_play.section_${pageIdCounter}_button`]: {
            "$toggle_group_forced_index": pageIdCounter
        }
    })

    tips.push({
        [`section_${pageIdCounter}@how_to_play.section_${pageIdCounter}`]: {}
    })

    pageIdCounter++;
}

const config = [
    {
        "category": "Information",
        "files": [
            "index"
        ]
    },
    {
        "category": "Syntax",
        "files": [
            "text",
            "images",
            "icons"
        ]
    }
]

// await Promise.all(config.map(async (section) => {
//     categoryIdCounter++;
//     buttons.push({
//         [`category_${categoryIdCounter}@how_to_play_common.topic_category`]: {
//             "$category": section.category
//         }
//     })

//     await Promise.all(section.files.map(async (filePath) => {
//         const data = await readFile("./docs/" + filePath + ".md", { encoding: "utf-8" })
//         ParseFile(data)
//         console.log("Parsed: ./docs/" + filePath + ".md" )
//     }))
// }))

for await (var section of config) {
    categoryIdCounter++;

    buttons.push({
        [`category_${categoryIdCounter}@how_to_play_common.topic_category`]: {
            "$category": section.category
        }
    })

    for await (var filePath of section.files) {
        const data = await readFile("./docs/" + filePath + ".md", { encoding: "utf-8" })
        ParseFile(data)
        console.log("Parsed: ./docs/" + filePath + ".md" )
    }
}

console.log("Loaded all files")

var output = {
    "namespace": "how_to_play",
    "how_to_play_screen@how_to_play_common.screen_base": {
        "$selector_stack_panel": "how_to_play.selector_stack_panel",
        "$section_content_panels": "how_to_play.section_content_panels",
        "$header_safezone_control": "common_store.store_top_bar_filler",
        "$header_bar_control": "common_store.store_top_bar",
        "$is_full_screen_layout": true
    },
    "selector_stack_panel": {
        "type": "stack_panel",
        "anchor_from": "top_left",
        "anchor_to": "top_left",
        "orientation": "vertical",
        "$default_selector_toggle_index": 0,
        "controls": [
            {
                "how_to_play_selector_pane": {
                    "type": "stack_panel",
                    "controls": buttons
                }
            }
        ]
    },
    "section_content_panels": {
        "type": "stack_panel",
        "anchor_from": "top_left",
        "anchor_to": "top_left",
        "size": [
            "100% - 5px",
            "100%c + 5px"
        ],
        "offset": [
            2,
            0
        ],
        "controls": [
            {
                "general_tips_sections": {
                    "type": "stack_panel",
                    "controls": tips
                }
            }
        ]
    }
}

// Add json objects to output
sections.forEach((section) => {
    Object.assign(output, section);
})

await clipboardy.write(JSON.stringify(output))
// collection.add("./how_to_play_screen.json", output)

// export default collection;