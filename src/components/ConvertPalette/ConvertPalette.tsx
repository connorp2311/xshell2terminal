import * as React from "react";
import { useState } from "react";
import TextBox from "../TextBox/TextBox";
import "./ConvertPalette.css";

type Button = {
  name: string;
  code: string;
};

function ConvertPalette() {
  const [output, setOutput] = useState<string>("");

  //Function to seprate the name of the button and the code
  const getButtonNameAndCode = (line: string) => {
    let name = line.substring(line.indexOf('=') + 1, line.indexOf('\\n'));
    let code = line.substring(line.indexOf('\\n'), line.length);
    //remove random number at start of code, no idea why its there
    code = code.substring(code.indexOf(']') + 1, code.length);
    const output: Button = {
      name,
      code
    };
    return output;
  };


  const getButtons = (fileContent: string) => {
    let buttons: Button[] = [];
    //get each line that starts with "Button_#="
    const regex = /Button_\d+=.*/g;
    const matches = fileContent.match(regex);
    if (matches) {
      matches.forEach(match => {
        buttons.push(getButtonNameAndCode(match));
      });
    }
    return buttons;
  };

  const generateConfig = (fileName: string, buttons: Button[]) => {
    let config = "";
    config += `{\n\t"name": "${fileName}",\n\t"icon": "\ud83d\udd35",\n\t"commands": [\n`;
    buttons.forEach(button => {
      config += "\t\t" + JSON.stringify({ "name": button.name, "command": { "action": "sendInput", "input": button.code } }) + ",\n";
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
          let buttons: Button[] = getButtons(e.target.result as string);
          generateConfig(fileName, buttons);
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <div className="parent">
      <div className="div1">
        <div style={{padding: 10}}>
          <div>Upload xshell .qbl files to convert into terminal config values</div>
          <div><input type="file" onChange={uploadFile} /></div>
          <div><a href="https://learn.microsoft.com/en-us/windows/terminal/command-palette" target={"_blank"}>Microsoft Docs</a></div>
        </div>
      </div>
      <div className="div2">
        <TextBox data={output}></TextBox>
      </div>
    </div>
  );
}

export default ConvertPalette;