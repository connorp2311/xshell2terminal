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
  const [output, setOutput] = useState<string>("Output will appear here...");

  const getButtonsV1 = (fileContent: string) => {
    let buttonList: Button[] = [];
    // get each button id
    const buttonIdRegex = /^CR_(\d+)=.*/gm;
    let buttonIdMatch;
    while ((buttonIdMatch = buttonIdRegex.exec(fileContent)) !== null) {
      //get the button name that starts with "Label_index="
      const buttonNameRegex = new RegExp(`Label_${buttonIdMatch[1]}=([^\n]+)`);
      const buttonNameMatch = fileContent.match(buttonNameRegex);

      //get the button code that starts with "Button_index="
      const buttonCodeRegex = new RegExp(`Text_${buttonIdMatch[1]}=([^\n]+)`);
      const buttonCodeMatch = fileContent.match(buttonCodeRegex);

      if (buttonNameMatch && buttonCodeMatch) {
        const button: Button = {
          name: buttonNameMatch[1],
          code: buttonCodeMatch[1]
        };
        buttonList = [...buttonList, button];
      }
    }
    return buttonList;
  };

  const getButtonsV2 = (fileContent: string) => {
    let buttonList: Button[] = [];
    //get each line that starts with "Button_#="
    const buttonLineRegex = /Button_\d+=.*/g;
    const buttonLineMatches = fileContent.match(buttonLineRegex);
    if (buttonLineMatches) {
      buttonLineMatches.forEach(buttonLine => {
        let buttonName = buttonLine.substring(buttonLine.indexOf('=') + 1, buttonLine.indexOf('\\n'));
        let buttonCode = buttonLine.substring(buttonLine.indexOf('\\n'), buttonLine.length);
        //remove random number at start of code, no idea why its there
        buttonCode = buttonCode.substring(buttonCode.indexOf(']') + 1, buttonCode.length);
        const button: Button = {
          name: buttonName,
          code: buttonCode
        };
        buttonList.push(button);
      });
    }
    return buttonList;
  };

  const determineVersion = (fileContent: string) => fileContent.indexOf('[Info]') === 0 ? 2 : 1;

  const generateConfig = (fileName: string, fileContent: string) => {
    const version = determineVersion(fileContent);
    const buttons = version === 1 ? getButtonsV1(fileContent) : getButtonsV2(fileContent);
    const commands = buttons.map(({ name, code }) => ({ name, command: { action: "sendInput", input: code } }));
    const config = JSON.stringify({ name: fileName, icon: "\ud83d\udd35", commands }, null, 2);
    setOutput(config);
  };

  //function to upload file and set the fileContent to the file content
  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const fileName = file.name.split('.')[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        generateConfig(fileName, reader.result as string);
      });
      reader.readAsText(file);
    } else {
      console.log("Please upload a file");
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
    <div id="main" style={{ display: 'flex' }}>
      <div id="leftSide" style={{ flex: 0.5 }}>
        <div className="title">Xshell 2 Terminal</div>
        <br />
        <label htmlFor="file-upload" className="custom-file-upload">
          Upload File
        </label>
        <div><input id="file-upload" type="file" onChange={uploadFile} /></div>
        <br />
        1. Open xshell and browse button sets<br />
        2. Click on the button set and select "Export"<br />
        3. Upload the .qbl file into this tool<br />
        4. Open your terminal settings and hit "Open JSON file"<br />
        5. Copy the output from this tool and paste it into the bottom of the actions array<br /><br />
        Example:<br />
        <div style={{ height: 220 }}><TextBox data={guideCode}></TextBox></div>
        <a href="https://learn.microsoft.com/en-us/windows/terminal/command-palette" target={"_blank"}>Microsoft Docs</a>
        <br />
        <a href="https://netsarang.atlassian.net/wiki/spaces/ENSUP/pages/31654174/Managing+the+quick+command+sets" target={"_blank"}>Netsarang Docs</a>
      </div>
      <div id="rightSide" style={{ flex: 1 }}>
        <TextBox data={output} />
      </div>
    </div>
  );
}

export default ConvertPalette;