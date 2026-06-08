import React, { useEffect, useState } from "react";

type BlurTextProps = {
  children: React.ReactNode;
  animateBy?: "words" | "letters";
  delay?: number; // ms between each word/letter
  className?: string;
  direction?: "top" | "bottom";
};

const BlurText: React.FC<BlurTextProps> = ({
  children,
  animateBy = "words",
  delay = 80,
  className = "",
  direction = "top",
}) => {
  const text = React.Children.toArray(children).join("");
  const elements =
    animateBy === "words" ? text.split(" ") : text.split("");

  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  return (
    <p className={`flex flex-wrap ${className}`}>
      {elements.map((segment, index) => (
        <span
          key={index}
          className={`blur-span ${show ? "show" : ""}`}
          style={{
            animationDelay: `${index * delay}ms`,
            transform:
              direction === "top" ? "translateY(-20px)" : "translateY(20px)",
          }}
        >
          {segment === " " ? "\u00A0" : segment}
          {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
        </span>
      ))}
    </p>
  );
};

export default BlurText;
