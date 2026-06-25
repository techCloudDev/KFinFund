import { useState, cloneElement, Children } from "react";

export function Avatar({ children, className = "", style = {} }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`mf-avatar ${className}`}
      style={{
        position: "relative",
        display: "flex",
        height: "40px",
        width: "40px",
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: "50%",
        backgroundColor: "#E5E7EB",
        ...style
      }}
    >
      {Children.map(children, (child) => {
        if (!child) return null;

        if (child.type === AvatarImage) {
          return cloneElement(child, {
            onLoad: () => setImageLoaded(true),
            onError: () => setHasError(true),
          });
        }

        if (child.type === AvatarFallback) {
          if (imageLoaded && !hasError) return null;
          return child;
        }

        return child;
      })}
    </div>
  );
}

export function AvatarImage({ src, alt, className = "", style = {}, onLoad, onError }) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      onLoad={onLoad}
      onError={onError}
      className={`mf-avatar-img ${className}`}
      style={{
        aspectRatio: "1/1",
        height: "100%",
        width: "100%",
        objectFit: "cover",
        ...style
      }}
    />
  );
}

export function AvatarFallback({ children, className = "", style = {} }) {
  return (
    <div
      className={`mf-avatar-fallback ${className}`}
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        backgroundColor: "#6C3AED",
        color: "#FFFFFF",
        fontSize: "14px",
        fontWeight: "600",
        textTransform: "uppercase",
        userSelect: "none",
        width: "100%",
        height: "100%",
        ...style
      }}
    >
      {children}
    </div>
  );
}

export default Avatar;
