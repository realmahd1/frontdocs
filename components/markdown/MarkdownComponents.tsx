import type { Components } from "react-markdown";

export const markdownComponents: Components = {
  a({ href, children, ...props }) {
    const isExternal =
      href?.startsWith("http://") ||
      href?.startsWith("https://");

    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={
          isExternal
            ? "noreferrer noopener"
            : undefined
        }
        {...props}
      >
        {children}
      </a>
    );
  },

  img({ src, alt, ...props }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src || ""}
        alt={alt || ""}
        loading="lazy"
        {...props}
      />
    );
  },
};
