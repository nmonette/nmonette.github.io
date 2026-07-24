import "./hover_button.css";

export default function HoverButton({image, text, onClick, imageClassName = ""}) {
  return (
    <div className="button-container">
      <img
        onClick={onClick}
        src={image}
        alt="Hover Button"
        className={`hover-button ${imageClassName}`.trim()}
        height={120}
        style={{clipPath: 'inset(5px)'}}
      />
      <div className="hover-text">{text}</div>
    </div>
  );
}
