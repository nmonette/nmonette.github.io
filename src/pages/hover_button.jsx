import "./hover_button.css";

export default function HoverButton({image, text, onClick}) {
  return (
    <div className="button-container">
      <img
        onClick={onClick}
        src={image}
        alt="Hover Button"
        className="hover-button"
        height={100}
        style={{clipPath: 'inset(5px)'}}
      />
      <div className="hover-text">{text}</div>
    </div>
  );
}

