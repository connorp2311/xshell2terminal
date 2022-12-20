import * as React from "react";
import { useState } from "react";
import TextBox from "../TextBox/TextBox";
import "./ConvertPalette.css";
import Popup from 'reactjs-popup';

type Button = {
  name: string;
  code: string;
};

function ConvertPalette() {
  const [output, setOutput] = useState<string>("");

  const getButtonsV1 = (fileContent: string) => {
    console.log("Generating config for old version");
    let buttons: Button[] = [];
    //get each button id
    const regex = /^CR_\d+=.*/gm;
    const matches = fileContent.match(regex);

    if (matches) {
      let buttonIndexs: string[] = [];

      matches.forEach(match => {
        //get number after =
        const regex = /=.*/g;
        const matchNumber = match.match(regex);
        if (matchNumber) {
          //get numbert after _ and before =
          const number = match.substring(match.indexOf('_') + 1, match.indexOf('='));
          buttonIndexs.push(number);
        }
      });

      buttonIndexs.forEach(index => {
        //get the button name what starts with "Label_index="
        const regexName = new RegExp(`Label_${index}=.*`);
        const matchName = fileContent.match(regexName);

        //get the button code what starts with "Button_index="
        const regexCode = new RegExp(`Text_${index}=.*`);
        const matchCode = fileContent.match(regexCode);

        if (matchName && matchCode) {
          const name: string = matchName[0].substring(matchName[0].indexOf('=') + 1, matchName[0].length);
          const code: string = matchCode[0].substring(matchCode[0].indexOf('=') + 1, matchCode[0].length);
          const button: Button = {
            name,
            code
          };
          console.log(button);
          buttons.push(button);
        }
      });
    };
    return buttons;
  };

  const getButtonsV2 = (fileContent: string) => {
    console.log("Generating config for new version");
    let buttons: Button[] = [];
    //get each line that starts with "Button_#="
    const regex = /Button_\d+=.*/g;
    const matches = fileContent.match(regex);
    if (matches) {
      matches.forEach(match => {
        let name = match.substring(match.indexOf('=') + 1, match.indexOf('\\n'));
        let code = match.substring(match.indexOf('\\n'), match.length);
        //remove random number at start of code, no idea why its there
        code = code.substring(code.indexOf(']') + 1, code.length);
        const button: Button = {
          name,
          code
        };
        console.log(button);
        buttons.push(button);
      });
    }
    return buttons;
  };

  const generateConfig = (fileName: string, fileContent: string) => {
    //determine export version
    let version = 1;
    let config = "";
    let buttons: Button[] = [];

    if (fileContent.indexOf('[Info]') === 0) {
      version = 2;
    }

    if (version === 1) {
      buttons = getButtonsV1(fileContent);
    }

    if (version === 2) {
      buttons = getButtonsV2(fileContent);
    }

    config += `{\n\t"name": "${fileName}",\n\t"icon": "\ud83d\udd35",\n\t"commands": [\n`;
    buttons.forEach(button => {
      config += "\t\t" + JSON.stringify({ "name": button.name, "command": { "action": "sendInput", "input": button.code } });
      //if this isnt the last button add a comma
      if (button !== buttons[buttons.length - 1]) {
        config += ",";
      }
      config += "\n";
    });
    config += "\t]\n}";
    setOutput(config);
  };

  //function to upload file and set the fileContent to the file content
  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const fileName = file.name.substring(0, file.name.indexOf('.'));
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          generateConfig(fileName, e.target.result as string);
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const guideCode = `"actions":
  [
      {
          "command": "find",
          "keys": "ctrl+shift+f"
      },
      Code goes here
  ]
`

  return (
    <div className="parent">
      <div className="div1">
        <div style={{ padding: 10 }}>
          <div>Upload xshell .qbl files to convert into terminal config values</div>
          <div><input type="file" onChange={uploadFile} /></div>
          <Popup trigger={<button>Guide</button>} modal={true}>
            <div className="modal">
              <h2>Guide</h2>
              1. Open xshell and browse button sets<br />
              2. Click on the button set and select "Export"<br />
              3. Import the .qbl file into this tool<br />
              4. Open your terminal settings and hit "Open JSON file"<br />
              5. Copy the output from this tool and paste it into the bottom of the actions array<br /><br />
              Example:<br />
              <div style={{ height: 220 }}><TextBox data={guideCode}></TextBox></div>
              <a href="https://learn.microsoft.com/en-us/windows/terminal/command-palette" target={"_blank"}>Microsoft Docs</a>
              <br />
              <a href="https://netsarang.atlassian.net/wiki/spaces/ENSUP/pages/31654174/Managing+the+quick+command+sets" target={"_blank"}>Netsarang Docs</a>
            </div>
          </Popup>
        </div>
      </div>
      <div className="div2">
        <TextBox data={output}></TextBox>
      </div>
    </div>
  );
}

export default ConvertPalette;