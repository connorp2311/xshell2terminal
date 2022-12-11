import "./TextBox.css";

function TextBox(props: { data: string }) {
    return (
        <textarea disabled defaultValue={""} value={props.data} />
    )
} 

export default TextBox;

